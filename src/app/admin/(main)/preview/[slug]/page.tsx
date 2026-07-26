import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ContentTypeBadge } from "@/components/articles/ContentTypeBadge";
import { ReadingTime } from "@/components/articles/ReadingTime";
import { formatDate } from "@/lib/utils";
import { extractHeadings, addIdsToHeadings, sanitizeHtml } from "@/lib/html";
import { ReadingProgress } from "@/components/articles/ReadingProgress";
import { TableOfContents } from "@/components/articles/TableOfContents";
import Link from "next/link";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let article = null;
  try {
    article = await prisma.article.findUnique({ where: { slug } });
  } catch {}

  if (!article) notFound();

  const safeContent = sanitizeHtml(article.content);
  const contentHtml = addIdsToHeadings(safeContent);
  const headings = extractHeadings(article.content);

  return (
    <>
      <div className="sticky top-0 z-50 border-b border-amber-500/50 bg-amber-50/90 px-6 py-2 text-center text-xs text-amber-800 backdrop-blur-sm dark:bg-amber-950/80 dark:text-amber-200">
        Preview — {article.status === "draft" ? "Draft" : "Published"}.{" "}
        <Link
          href={`/admin/articles/${article.id}`}
          className="underline underline-offset-2"
        >
          Edit
        </Link>
      </div>
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
            <span className="capitalize">{article.category.replace("-", " ")}</span>
            {article.tags.length > 0 && (
              <span className="flex gap-2">
                {article.tags.map((tag: string) => (
                  <span key={tag} className="text-muted">#{tag}</span>
                ))}
              </span>
            )}
          </div>
        </header>
        {article.featuredImage && (
          <div className="mx-auto mt-12 max-w-4xl">
            <img src={article.featuredImage} alt={article.title} className="w-full rounded-lg object-cover" loading="lazy" />
          </div>
        )}
        <div className="mx-auto mt-16 flex gap-16">
          <div className="min-w-0 flex-1 max-w-3xl">
            <div className="prose" dangerouslySetInnerHTML={{ __html: contentHtml }} />
          </div>
          {headings.length > 1 && (
            <aside className="hidden lg:block w-56 shrink-0">
              <TableOfContents headings={headings} />
            </aside>
          )}
        </div>
      </article>
    </>
  );
}
