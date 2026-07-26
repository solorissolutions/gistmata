import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORIES, CONTENT_TYPES, formatDate, readingTime } from "@/lib/utils";
import type { ArticleData } from "@/types";

function categoryLabel(category: string) {
  return CATEGORIES[category as keyof typeof CATEGORIES]?.label ?? category;
}

export function Hero({ article }: { article: ArticleData | null }) {
  if (!article) {
    return (
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Gistmata — A Knowledge Publication
          </span>
          <h1 className="mt-6 max-w-3xl font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl text-balance">
            The first stories are on their way.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Gistmata is a living archive of essays, research notes, and field
            reports on the edges of technology, intelligence, and human
            development. The inaugural publications are being written now.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/archive"
              className="inline-flex h-11 items-center gap-2 bg-accent px-6 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              Explore the archive
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
            >
              What is Gistmata?
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const contentType =
    CONTENT_TYPES[article.contentType as keyof typeof CONTENT_TYPES]?.label;

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Featured Story
        </span>
        <div className="mt-8 grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <Link
            href={`/articles/${article.slug}`}
            className="group block lg:col-span-7"
          >
            <div className="relative aspect-[16/10] overflow-hidden border border-border bg-card">
              {article.featuredImage ? (
                <img
                  src={article.featuredImage || "/placeholder.svg"}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center px-8">
                  <span className="text-center font-serif text-2xl leading-snug text-muted-foreground/70">
                    {categoryLabel(article.category)}
                  </span>
                </div>
              )}
            </div>
          </Link>

          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <span>{categoryLabel(article.category)}</span>
              {contentType && (
                <>
                  <span aria-hidden className="text-border">
                    /
                  </span>
                  <span>{contentType}</span>
                </>
              )}
            </div>
            <h1 className="mt-4 font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl text-balance">
              <Link
                href={`/articles/${article.slug}`}
                className="transition-colors hover:text-muted-foreground"
              >
                {article.title}
              </Link>
            </h1>
            {article.excerpt && (
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
                {article.excerpt}
              </p>
            )}
            <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
              {article.publishedAt && (
                <span>{formatDate(article.publishedAt)}</span>
              )}
              <span aria-hidden className="text-border">
                •
              </span>
              <span>{readingTime(article.content)}</span>
            </div>
            <Link
              href={`/articles/${article.slug}`}
              className="mt-8 inline-flex h-11 items-center gap-2 bg-accent px-6 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              Read the full story
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
