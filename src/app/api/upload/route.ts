import { NextResponse } from "next/server";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_WIDTH = 2400;
const THUMB_WIDTH = 400;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const rl = await rateLimit(`upload:${ip}`, { interval: 60_000, maxRequests: 10 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const alt = (formData.get("alt") as string) || null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} is not allowed. Accepted: ${ALLOWED_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max size: ${MAX_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const metadata = await sharp(buffer).metadata();

    const safeExt = (file.name.split(".").pop() || "jpg").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${random}.${safeExt}`;

    const path = await import("path");
    const fs = await import("fs/promises");

    const publicDir = path.join(process.cwd(), "public");
    const uploadsDir = path.join(publicDir, "uploads");
    const thumbDir = path.join(uploadsDir, "thumb");

    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.mkdir(thumbDir, { recursive: true });

    const optimized = sharp(buffer);
    if ((metadata.width || 0) > MAX_WIDTH) {
      optimized.resize(MAX_WIDTH, undefined, { withoutEnlargement: true });
    }

    if (file.type === "image/jpeg" || file.type === "image/webp" || file.type === "image/avif") {
      await optimized.jpeg({ quality: 85, progressive: true }).toFile(path.join(uploadsDir, filename));
    } else if (file.type === "image/png") {
      await optimized.png({ quality: 85 }).toFile(path.join(uploadsDir, filename));
    } else {
      await optimized.toFile(path.join(uploadsDir, filename));
    }

    if (file.type !== "image/gif") {
      await sharp(buffer)
        .resize(THUMB_WIDTH, undefined, { withoutEnlargement: true })
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

    return NextResponse.json({
      ...media,
      url: `/uploads/${filename}`,
      thumbUrl: file.type === "image/gif" ? `/uploads/${filename}` : `/uploads/thumb/${filename}`,
    });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
