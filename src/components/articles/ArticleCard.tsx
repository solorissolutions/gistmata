import Link from "next/link";
import { ContentTypeBadge } from "./ContentTypeBadge";
import { ReadingTime } from "./ReadingTime";
import { formatDate } from "@/lib/utils";
import type { ArticleData } from "@/types";

export function ArticleCard({ article }: { article: ArticleData }) {
  return (
    <Link href={`/articles/${article.slug}`} className="group block">
      <article className="border-b border-border py-6 transition-colors hover:border-foreground/30">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <ContentTypeBadge type={article.contentType} />
            {article.publishedAt && (
              <time className="text-xs text-muted-foreground">
                {formatDate(article.publishedAt)}
              </time>
            )}
          </div>
          <h3 className="text-lg font-medium leading-snug tracking-tight text-foreground transition-colors group-hover:text-muted-foreground">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <ReadingTime content={article.content} />
            <span className="capitalize">{article.category.replace("-", " ")}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
