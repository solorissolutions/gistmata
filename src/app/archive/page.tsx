import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { CONTENT_TYPES, CATEGORIES } from "@/lib/utils";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CollectionPageSchema } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Archive",
  description: "Browse all articles published on Gistmata.",
};

const PER_PAGE = 10;

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const categoryFilter = params.category as string | undefined;
  const typeFilter = params.type as string | undefined;
  const tagFilter = params.tag as string | undefined;
  const page = Math.max(1, parseInt(params.page as string) || 1);

  let articles: any[] = [];
  let total = 0;

  try {
    const where: Record<string, unknown> = { status: "published" };
    if (categoryFilter && categoryFilter in CATEGORIES) where.category = categoryFilter;
    if (typeFilter && typeFilter in CONTENT_TYPES) where.contentType = typeFilter;
    if (tagFilter) where.tags = { has: tagFilter };

    const [fetchedArticles, count] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
      }),
      prisma.article.count({ where }),
    ]);
    articles = fetchedArticles;
    total = count;
  } catch {}

  const totalPages = Math.ceil(total / PER_PAGE);

  function buildHref(overrides: Record<string, string | undefined>) {
    const segs = new URLSearchParams();
    const v = overrides.category ?? categoryFilter; if (v) segs.set("category", v);
    const v2 = overrides.type ?? typeFilter; if (v2) segs.set("type", v2);
    const v3 = overrides.tag ?? tagFilter; if (v3) segs.set("tag", v3);
    if (overrides.page) segs.set("page", overrides.page);
    const qs = segs.toString();
    return `/archive${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <CollectionPageSchema
        title="Archive — Gistmata"
        description="Browse all published articles on Gistmata."
      />
      <Breadcrumbs items={[{ label: "Archive", href: "/archive" }]} />
      <h1 className="text-3xl font-light tracking-tight sm:text-4xl font-serif">
        Archive
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Browse all published articles.
      </p>

      <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-b border-border pb-0">
        <a
          href="/archive"
          className={`text-sm transition-colors pb-3 border-b-2 ${
            !categoryFilter && !typeFilter && !tagFilter
              ? "text-foreground font-medium border-foreground"
              : "text-muted-foreground hover:text-foreground border-transparent hover:border-foreground/30"
          }`}
        >
          All
        </a>
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <a
            key={key}
            href={`/archive?category=${key}`}
            className={`text-sm transition-colors pb-3 border-b-2 ${
              categoryFilter === key
                ? "text-foreground font-medium border-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent hover:border-foreground/30"
            }`}
          >
            {cat.label}
          </a>
        ))}
        <span className="mx-2 self-center text-xs text-muted-foreground/30">|</span>
        {Object.entries(CONTENT_TYPES).map(([key, ct]) => (
          <a
            key={key}
            href={`/archive?type=${key}`}
            className={`text-sm transition-colors pb-3 border-b-2 ${
              typeFilter === key
                ? "text-foreground font-medium border-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent hover:border-foreground/30"
            }`}
          >
            {ct.label}
          </a>
        ))}
      </div>

      {tagFilter && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Filtered by tag:</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-border px-2.5 py-0.5 text-xs text-foreground">
            #{tagFilter}
            <a href={buildHref({ tag: undefined, page: "1" })} className="ml-1 text-muted-foreground hover:text-foreground">&times;</a>
          </span>
        </div>
      )}

      <div className="mt-2 divide-y divide-border">
        {articles.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No articles found.</p>
        ) : (
          articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
          {page > 1 && (
            <Link href={buildHref({ page: String(page - 1) })}
              className="border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">
              Previous
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={buildHref({ page: String(p) })}
              className={`border px-3 py-1.5 text-xs transition-colors ${
                p === page
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}>
              {p}
            </Link>
          ))}
          {page < totalPages && (
            <Link href={buildHref({ page: String(page + 1) })}
              className="border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
