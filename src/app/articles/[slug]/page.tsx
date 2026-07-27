import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ContentTypeBadge } from "@/components/articles/ContentTypeBadge";
import { ReadingTime } from "@/components/articles/ReadingTime";
import { formatDate } from "@/lib/utils";
import { extractHeadings, addIdsToHeadings, sanitizeHtml } from "@/lib/html";
import { ReadingProgress } from "@/components/articles/ReadingProgress";
import { TableOfContents } from "@/components/articles/TableOfContents";
import { RelatedArticles } from "@/components/articles/RelatedArticles";
import { KnowledgeGraph } from "@/components/articles/KnowledgeGraph";
import { ArticleSchema } from "@/components/articles/ArticleSchema";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let article = null;
  try {
    article = await prisma.article.findUnique({
      where: { slug, status: "published" },
    });
  } catch {}

  if (!article) notFound();

  const safeContent = sanitizeHtml(article.content);
  const contentHtml = addIdsToHeadings(safeContent);
  const headings = extractHeadings(article.content);

  return (
    <>
      <ArticleSchema article={article} />
      <ReadingProgress />
      <article className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <header className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3">
            <ContentTypeBadge type={article.contentType} />
            {article.publishedAt && (
              <time className="text-xs text-muted-foreground">
                {formatDate(article.publishedAt)}
              </time>
            )}
          </div>

          <h1 className="mt-6 text-3xl font-light leading-tight tracking-tight sm:text-4xl md:text-5xl">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="mt-4 text-xl text-muted-foreground leading-relaxed">
              {article.subtitle}
            </p>
          )}

          <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
            <ReadingTime content={article.content} />
            <span className="capitalize">
              {article.category.replace("-", " ")}
            </span>
            {article.tags.length > 0 && (
              <span className="flex flex-wrap gap-2">
                {article.tags.map((tag: string) => (
                  <a
                    key={tag}
                    href={`/archive?tag=${encodeURIComponent(tag)}`}
                    className="text-muted transition-colors hover:text-foreground"
                  >
                    #{tag}
                  </a>
                ))}
              </span>
            )}
          </div>
        </header>

        {article.featuredImage && (
          <div className="mx-auto mt-12 max-w-4xl">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full rounded-lg object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="mx-auto mt-16 flex gap-16">
          <div className="min-w-0 flex-1 max-w-3xl">
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </div>

          {headings.length > 1 && (
            <aside className="hidden lg:block w-56 shrink-0">
              <TableOfContents headings={headings} />
            </aside>
          )}
        </div>

        <div className="mx-auto max-w-3xl">
          <RelatedArticles
            category={article.category}
            tags={article.tags}
            currentSlug={article.slug}
          />
          <KnowledgeGraph
            tags={article.tags}
            category={article.category}
            currentSlug={article.slug}
          />
        </div>
      </article>
    </>
  );
}

export async function generateStaticParams() {
  return [];
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let article = null;
  try {
    article = await prisma.article.findUnique({
      where: { slug, status: "published" },
    });
  } catch {}

  if (!article) return { title: "Not Found" };

  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt || "",
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt || "",
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      images: article.featuredImage ? [{ url: article.featuredImage }] : [],
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt || "",
      images: article.featuredImage ? [article.featuredImage] : [],
    },
    other: {
      "article:published_time": article.publishedAt?.toISOString() || "",
      "article:modified_time": article.updatedAt.toISOString(),
      "article:section": article.category,
      ...Object.fromEntries(
        (article.tags || []).map((tag: string) => [`article:tag`, tag])
      ),
    },
  };
}
