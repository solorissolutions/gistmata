import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicationCard, PlaceholderCard } from "./PublicationCard";
import type { ArticleData } from "@/types";

export function LatestPublications({
  articles,
}: {
  articles: ArticleData[];
}) {
  // Keep the grid feeling alive even with few articles by topping up
  // to a full row of cards with "coming soon" placeholders.
  const minCards = 3;
  const placeholders = Math.max(0, minCards - articles.length);

  return (
    <section className="border-b border-border py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Latest Publications
            </h2>
            <p className="mt-2 font-serif text-2xl tracking-tight text-foreground sm:text-3xl">
              Recently from the archive
            </p>
          </div>
          <Link
            href="/archive"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground sm:inline-flex"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <PublicationCard key={article.id} article={article} />
          ))}
          {Array.from({ length: placeholders }).map((_, i) => (
            <PlaceholderCard key={`placeholder-${i}`} />
          ))}
        </div>

        <div className="mt-10 sm:hidden">
          <Link
            href="/archive"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
          >
            View all publications
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
