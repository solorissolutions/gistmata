import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ContentTypeBadge } from "./ContentTypeBadge";
import { formatDate } from "@/lib/utils";

interface Props {
  category: string;
  tags: string[];
  currentSlug: string;
}

interface ConnectedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  contentType: string;
  publishedAt: Date | null;
  sharedTags: string[];
}

export async function RelatedArticles({
  category,
  tags,
  currentSlug,
}: Props) {
  let related: ConnectedArticle[] = [];

  try {
    const articles = await prisma.article.findMany({
      where: {
        status: "published",
        slug: { not: currentSlug },
        OR: [
          { category },
          ...(tags.length > 0 ? [{ tags: { hasSome: tags } }] : []),
        ],
      },
      orderBy: { publishedAt: "desc" },
      take: 6,
    });

    related = articles.map((a) => ({
      ...a,
      sharedTags: (a.tags as string[]).filter((t: string) =>
        tags.includes(t)
      ),
    }));
  } catch {
    return null;
  }

  if (related.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-12">
      <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        Related Content
      </h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="group block border border-border p-5 transition-colors hover:border-foreground/30"
          >
            <ContentTypeBadge type={article.contentType} />
            <h3 className="mt-2 text-sm font-medium leading-snug tracking-tight text-foreground transition-colors group-hover:text-muted-foreground">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {article.excerpt}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {article.sharedTags.length > 0 && (
                <span className="text-[10px] text-muted">
                  Shared: {article.sharedTags.map((t) => `#${t}`).join(" ")}
                </span>
              )}
              {article.publishedAt && (
                <time className="ml-auto text-[10px] text-muted">
                  {formatDate(article.publishedAt)}
                </time>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
