import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORIES, CONTENT_TYPES, formatDate, readingTime } from "@/lib/utils";
import type { ArticleData } from "@/types";

function categoryLabel(category: string) {
  return CATEGORIES[category as keyof typeof CATEGORIES]?.label ?? category;
}

export function FeaturedStory({ article }: { article: ArticleData | null }) {
  if (!article) return null;

  const contentType =
    CONTENT_TYPES[article.contentType as keyof typeof CONTENT_TYPES]?.label;

  return (
    <section className="border-b border-border bg-accent text-accent-foreground">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <span className="text-xs font-medium uppercase tracking-widest text-accent-foreground/60">
          Editor&apos;s Pick
        </span>
        <div className="mt-8 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="order-2 lg:order-1">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-accent-foreground/60">
              <span>{categoryLabel(article.category)}</span>
              {contentType && (
                <>
                  <span aria-hidden className="text-accent-foreground/30">
                    /
                  </span>
                  <span>{contentType}</span>
                </>
              )}
            </div>
            <h2 className="mt-4 font-serif text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl text-balance">
              <Link
                href={`/articles/${article.slug}`}
                className="transition-opacity hover:opacity-80"
              >
                {article.title}
              </Link>
            </h2>
            {article.excerpt && (
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-accent-foreground/70 text-pretty">
                {article.excerpt}
              </p>
            )}
            <div className="mt-6 flex items-center gap-3 text-xs text-accent-foreground/60">
              {article.publishedAt && (
                <span>{formatDate(article.publishedAt)}</span>
              )}
              <span aria-hidden className="text-accent-foreground/30">
                •
              </span>
              <span>{readingTime(article.content)}</span>
            </div>
            <Link
              href={`/articles/${article.slug}`}
              className="mt-8 inline-flex h-11 items-center gap-2 border border-accent-foreground/40 px-6 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-foreground hover:text-accent"
            >
              Read the full story
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <Link
            href={`/articles/${article.slug}`}
            className="group order-1 block lg:order-2"
          >
            <div className="relative aspect-[16/10] overflow-hidden border border-accent-foreground/20">
              {article.featuredImage ? (
                <img
                  src={article.featuredImage || "/placeholder.svg"}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-accent-foreground/5 px-8">
                  <span className="text-center font-serif text-2xl leading-snug text-accent-foreground/50">
                    {categoryLabel(article.category)}
                  </span>
                </div>
              )}
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
