import Link from "next/link";
import { CATEGORIES, CONTENT_TYPES, formatDate, readingTime } from "@/lib/utils";
import type { ArticleData } from "@/types";

function categoryLabel(category: string) {
  return CATEGORIES[category as keyof typeof CATEGORIES]?.label ?? category;
}

export function PublicationCard({ article }: { article: ArticleData }) {
  const contentType =
    CONTENT_TYPES[article.contentType as keyof typeof CONTENT_TYPES]?.label;

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex flex-col overflow-hidden border border-border bg-card transition-colors hover:border-foreground/40"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-background">
        {article.featuredImage ? (
          <img
            src={article.featuredImage || "/placeholder.svg"}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-6">
            <span className="text-center font-serif text-lg leading-snug text-muted-foreground/70">
              {categoryLabel(article.category)}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
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
        <h3 className="font-serif text-xl leading-snug tracking-tight text-foreground">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
        )}
        <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-muted-foreground">
          {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
          <span aria-hidden className="text-border">
            •
          </span>
          <span>{readingTime(article.content)}</span>
        </div>
      </div>
    </Link>
  );
}

export function PlaceholderCard({ label }: { label?: string }) {
  return (
    <div className="flex flex-col overflow-hidden border border-dashed border-border bg-background/40">
      <div className="flex aspect-[16/10] w-full items-center justify-center border-b border-dashed border-border">
        <span className="text-xs uppercase tracking-widest text-muted-foreground/60">
          Coming soon
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="text-xs uppercase tracking-widest text-muted-foreground/60">
          {label ?? "In progress"}
        </div>
        <div className="font-serif text-xl leading-snug tracking-tight text-muted-foreground/70">
          A new publication is being written.
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground/50">
          Gistmata is early-stage. Fresh essays, research notes, and field
          reports are on the way.
        </p>
      </div>
    </div>
  );
}
