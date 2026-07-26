"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "./prisma";
import { auth } from "./auth";
import { slugify, parseFeaturedIds, encodeFeaturedIds } from "./utils";
import { logAuditEvent } from "./audit";
import { validateCsrfToken } from "./csrf";

const ALLOWED_IMAGE_DOMAINS = [
  "images.unsplash.com",
  "plus.unsplash.com",
  "localhost",
];

const articleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  subtitle: z.string().max(300).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, "Content is required").max(200000),
  category: z.enum(["vibe-hacking", "last-resonance", "n-qai"]),
  contentType: z.enum([
    "essay",
    "research-note",
    "experiment-log",
    "field-report",
    "reflection",
  ]),
  tags: z.array(z.string().max(50)).max(10).default([]),
  featuredImage: z.string().url().optional().or(z.literal("")),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  status: z.enum(["draft", "published"]),
});

const upcomingSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
});

export type ArticleFormData = z.infer<typeof articleSchema>;

async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return session;
}

async function getClientIp(): Promise<string | undefined> {
  try {
    const h = await headers();
    return h.get("x-forwarded-for") || h.get("x-real-ip") || undefined;
  } catch {
    return undefined;
  }
}

async function csrfCheck(formData: FormData) {
  const token = formData.get("_csrf") as string | null;
  if (!token || !validateCsrfToken(token)) {
    throw new Error("Invalid or missing CSRF token. Please refresh and try again.");
  }
}

function validateFeaturedImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!ALLOWED_IMAGE_DOMAINS.includes(parsed.hostname) && !parsed.hostname.endsWith(".unsplash.com")) {
      throw new Error(`Featured image domain not allowed: ${parsed.hostname}`);
    }
    return url;
  } catch (e) {
    if (e instanceof Error && e.message.includes("domain not allowed")) throw e;
    return null;
  }
}

export async function createArticle(formData: FormData) {
  await requireAuth();
  await csrfCheck(formData);

  const raw = Object.fromEntries(formData);
  const tags = formData.getAll("tags").filter(Boolean);

  const parsed = articleSchema.parse({ ...raw, tags });

  const slug = slugify(parsed.title);
  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) throw new Error("An article with this title already exists.");

  const article = await prisma.article.create({
    data: {
      ...parsed,
      slug,
      featuredImage: validateFeaturedImageUrl(parsed.featuredImage),
      publishedAt: parsed.status === "published" ? new Date() : null,
    },
  });

  const ip = await getClientIp();
  await logAuditEvent("article.create", "Article", article.id, `Created: ${article.title}`, ip);

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath("/admin/articles");

  return { ok: true as const, redirectTo: "/admin/articles" };
}

export async function updateArticle(id: string, formData: FormData) {
  await requireAuth();
  await csrfCheck(formData);

  const raw = Object.fromEntries(formData);
  const tags = formData.getAll("tags").filter(Boolean);

  const parsed = articleSchema.parse({ ...raw, tags });

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) throw new Error("Article not found");

  const slug = parsed.title !== article.title ? slugify(parsed.title) : article.slug;

  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing && existing.id !== id) throw new Error("An article with this title already exists.");

  await prisma.article.update({
    where: { id },
    data: {
      ...parsed,
      slug,
      featuredImage: validateFeaturedImageUrl(parsed.featuredImage),
      publishedAt:
        parsed.status === "published" && !article.publishedAt
          ? new Date()
          : parsed.status === "draft"
          ? null
          : article.publishedAt,
    },
  });

  const ip = await getClientIp();
  await logAuditEvent("article.update", "Article", id, `Updated: ${parsed.title}`, ip);

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath(`/articles/${slug}`);
  revalidatePath("/admin/articles");

  return { ok: true as const, redirectTo: "/admin/articles" };
}

export async function deleteArticle(id: string, formData: FormData) {
  await requireAuth();
  await csrfCheck(formData);

  const article = await prisma.article.findUnique({ where: { id } });
  const title = article?.title || "unknown";

  await prisma.article.delete({ where: { id } });

  const ip = await getClientIp();
  await logAuditEvent("article.delete", "Article", id, `Deleted: ${title}`, ip);

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function publishArticle(id: string, formData: FormData) {
  await requireAuth();
  await csrfCheck(formData);

  await prisma.article.update({
    where: { id },
    data: { status: "published", publishedAt: new Date() },
  });

  const ip = await getClientIp();
  await logAuditEvent("article.publish", "Article", id, undefined, ip);

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath("/admin/articles");
}

export async function unpublishArticle(id: string, formData: FormData) {
  await requireAuth();
  await csrfCheck(formData);

  await prisma.article.update({
    where: { id },
    data: { status: "draft", publishedAt: null },
  });

  const ip = await getClientIp();
  await logAuditEvent("article.unpublish", "Article", id, undefined, ip);

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath("/admin/articles");
}

// Featured articles (up to 3)

export async function setFeaturedArticle(id: string, formData: FormData) {
  await requireAuth();
  await csrfCheck(formData);

  const config = await prisma.siteConfig.findUnique({ where: { id: "default" } });
  const ids = parseFeaturedIds(config?.featuredArticleId);

  if (ids.length >= 3 || ids.includes(id)) return;

  ids.push(id);
  const encoded = encodeFeaturedIds(ids);

  await prisma.siteConfig.upsert({
    where: { id: "default" },
    update: { featuredArticleId: encoded },
    create: { id: "default", featuredArticleId: encoded },
  });

  const ip = await getClientIp();
  await logAuditEvent("article.feature", "Article", id, undefined, ip);

  revalidatePath("/");
  revalidatePath("/admin/articles");
}

export async function clearFeaturedArticle(id: string, formData: FormData) {
  await requireAuth();
  await csrfCheck(formData);

  const config = await prisma.siteConfig.findUnique({ where: { id: "default" } });
  const ids = parseFeaturedIds(config?.featuredArticleId).filter((x) => x !== id);
  const encoded = ids.length > 0 ? encodeFeaturedIds(ids) : null;

  await prisma.siteConfig.upsert({
    where: { id: "default" },
    update: { featuredArticleId: encoded },
    create: { id: "default", featuredArticleId: encoded },
  });

  const ip = await getClientIp();
  await logAuditEvent("article.unfeature", "Article", id, undefined, ip);

  revalidatePath("/");
  revalidatePath("/admin/articles");
}

// Upcoming

export async function createUpcoming(formData: FormData) {
  await requireAuth();
  await csrfCheck(formData);

  const raw = Object.fromEntries(formData);
  const parsed = upcomingSchema.parse(raw);

  const maxSort = await prisma.upcoming.aggregate({ _max: { sortOrder: true } });
  const nextOrder = (maxSort._max.sortOrder ?? -1) + 1;

  await prisma.upcoming.create({
    data: {
      title: parsed.title,
      description: parsed.description || null,
      category: parsed.category || null,
      sortOrder: nextOrder,
    },
  });

  const ip = await getClientIp();
  await logAuditEvent("upcoming.create", "Upcoming", "", parsed.title, ip);

  revalidatePath("/");
  revalidatePath("/admin/upcoming");
}

export async function updateUpcoming(id: string, formData: FormData) {
  await requireAuth();
  await csrfCheck(formData);

  const raw = Object.fromEntries(formData);
  const parsed = upcomingSchema.parse(raw);

  await prisma.upcoming.update({
    where: { id },
    data: {
      title: parsed.title,
      description: parsed.description || null,
      category: parsed.category || null,
    },
  });

  const ip = await getClientIp();
  await logAuditEvent("upcoming.update", "Upcoming", id, parsed.title, ip);

  revalidatePath("/");
  revalidatePath("/admin/upcoming");
}

export async function deleteUpcoming(id: string, formData: FormData) {
  await requireAuth();
  await csrfCheck(formData);

  await prisma.upcoming.delete({ where: { id } });

  const ip = await getClientIp();
  await logAuditEvent("upcoming.delete", "Upcoming", id, undefined, ip);

  revalidatePath("/");
  revalidatePath("/admin/upcoming");
}

export async function reorderUpcoming(id: string, direction: "up" | "down", formData: FormData) {
  await requireAuth();
  await csrfCheck(formData);

  const item = await prisma.upcoming.findUnique({ where: { id } });
  if (!item) throw new Error("Item not found");

  const adjacent = await prisma.upcoming.findFirst({
    where: {
      sortOrder: direction === "up" ? { lt: item.sortOrder } : { gt: item.sortOrder },
    },
    orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
  });

  if (!adjacent) return;

  await prisma.upcoming.update({ where: { id: item.id }, data: { sortOrder: adjacent.sortOrder } });
  await prisma.upcoming.update({ where: { id: adjacent.id }, data: { sortOrder: item.sortOrder } });

  const ip = await getClientIp();
  await logAuditEvent("upcoming.reorder", "Upcoming", id, undefined, ip);

  revalidatePath("/");
  revalidatePath("/admin/upcoming");
}

// Media

export async function uploadMedia(formData: FormData) {
  await requireAuth();
  await csrfCheck(formData);

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("No file provided");

  const alt = (formData.get("alt") as string) || null;

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
  const MAX_SIZE = 10 * 1024 * 1024;

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`File type not allowed. Accepted: ${ALLOWED_TYPES.join(", ")}`);
  }
  if (file.size > MAX_SIZE) {
    throw new Error("File too large (max 10MB)");
  }

  const sharp = await import("sharp");
  const path = await import("path");
  const fs = await import("fs/promises");

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const metadata = await sharp.default(buffer).metadata();

  const safeExt = (file.name.split(".").pop() || "jpg").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const filename = `${timestamp}-${random}.${safeExt}`;

  const publicDir = path.join(process.cwd(), "public");
  const uploadsDir = path.join(publicDir, "uploads");
  const thumbDir = path.join(uploadsDir, "thumb");

  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.mkdir(thumbDir, { recursive: true });

  const optimized = sharp.default(buffer);
  if ((metadata.width || 0) > 2400) {
    optimized.resize(2400, undefined, { withoutEnlargement: true });
  }

  if (file.type === "image/jpeg" || file.type === "image/webp" || file.type === "image/avif") {
    await optimized.jpeg({ quality: 85, progressive: true }).toFile(path.join(uploadsDir, filename));
  } else if (file.type === "image/png") {
    await optimized.png({ quality: 85 }).toFile(path.join(uploadsDir, filename));
  } else {
    await optimized.toFile(path.join(uploadsDir, filename));
  }

  if (file.type !== "image/gif") {
    await sharp.default(buffer)
      .resize(400, undefined, { withoutEnlargement: true })
      .jpeg({ quality: 70 })
      .toFile(path.join(thumbDir, filename));
  }

  const media = await prisma.media.create({
    data: {
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      width: metadata.width || null,
      height: metadata.height || null,
      alt,
    },
  });

  const ip = await getClientIp();
  await logAuditEvent("media.upload", "Media", media.id, file.name, ip);

  revalidatePath("/admin/media");
  redirect("/admin/media");
}

export async function deleteMedia(id: string, formData: FormData) {
  await requireAuth();
  await csrfCheck(formData);

  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) throw new Error("Media not found");

  const fs = await import("fs/promises");
  const path = await import("path");

  const publicDir = path.join(process.cwd(), "public");
  const originalPath = path.join(publicDir, "uploads", media.filename);
  const thumbPath = path.join(publicDir, "uploads", "thumb", media.filename);

  try { await fs.unlink(originalPath); } catch {}
  try { await fs.unlink(thumbPath); } catch {}

  await prisma.media.delete({ where: { id } });

  const ip = await getClientIp();
  await logAuditEvent("media.delete", "Media", id, media.originalName, ip);

  revalidatePath("/admin/media");
}
