import { ArticleCard } from "@/components/articles/ArticleCard";
import type { ArticleData } from "@/types";

export function LatestPublications({
  articles,
}: {
  articles: ArticleData[];
}) {
  if (articles.length === 0) return null;

  return (
    <section className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Latest Publications
        </h2>
        <div className="mt-8 divide-y divide-border">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
