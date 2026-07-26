import type { Metadata } from "next";
import { searchArticles } from "@/lib/search";
import { ContentTypeBadge } from "@/components/articles/ContentTypeBadge";
import Link from "next/link";
import { SearchIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Search",
  description: "Search articles on Gistmata.",
  openGraph: {
    title: "Search — Gistmata",
    description: "Search across all articles, categories, tags, and concepts.",
  },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = (params.q as string) || "";
  const results = query ? await searchArticles(query) : [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `https://gistmata.com/search?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          }),
        }}
      />
      <h1 className="text-3xl font-light tracking-tight sm:text-4xl font-serif">
        Search
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Search across all articles, categories, tags, and concepts.
      </p>

      <div className="mt-8">
        <form action="/search" method="GET" className="flex gap-3">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search articles..."
              autoFocus
              className="w-full border border-border bg-transparent py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="border border-foreground px-6 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Search
          </button>
        </form>
      </div>

      <div className="mt-12">
        {query && results.length === 0 && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              No results found for &ldquo;{query}&rdquo;.
            </p>
            <p className="mt-1 text-xs text-muted">
              Try different keywords or browse the <Link href="/archive" className="underline underline-offset-2">articles</Link>.
            </p>
          </div>
        )}

        {query && results.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground">
              {results.length} result{results.length !== 1 ? "s" : ""} for
              &ldquo;{query}&rdquo;
            </p>
            <div className="mt-4 divide-y divide-border">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={`/articles/${result.slug}`}
                  className="group block py-5"
                >
                  <div className="flex items-center gap-2">
                    <ContentTypeBadge type={result.contentType} />
                    {result.publishedAt && (
                      <time className="text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat("en-US", {
                          year: "numeric", month: "short", day: "numeric",
                        }).format(result.publishedAt)}
                      </time>
                    )}
                  </div>
                  <h2 className="mt-1.5 text-base font-medium leading-snug tracking-tight text-foreground transition-colors group-hover:text-muted-foreground">
                    {result.title}
                  </h2>
                  {result.excerpt && (
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {result.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </>
        )}

        {!query && (
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Enter a search term to find articles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
