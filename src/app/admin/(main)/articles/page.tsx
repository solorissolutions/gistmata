import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  Check,
  X,
  Star,
} from "lucide-react";
import { parseFeaturedIds } from "@/lib/utils";
import { generateCsrfToken } from "@/lib/csrf";
import {
  publishArticle,
  unpublishArticle,
  deleteArticle,
  setFeaturedArticle,
  clearFeaturedArticle,
} from "@/lib/actions";

export default async function AdminArticlesPage() {
  const [articles, config] = await Promise.all([
    prisma.article.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.siteConfig.findUnique({ where: { id: "default" } }),
  ]);

  const featuredIds = parseFeaturedIds(config?.featuredArticleId);
  const csrfToken = generateCsrfToken();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-light tracking-tight">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-1.5 border border-foreground px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          <Plus className="h-3.5 w-3.5" />
          New Article
        </Link>
      </div>

      <div className="mt-8">
        {articles.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No articles yet. Create your first one.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {articles.map((article) => {
              const featuredIndex = featuredIds.indexOf(article.id);
              const isFeatured = featuredIndex !== -1;
              const slotsLeft = 3 - featuredIds.length;
              const canFeature = article.status === "published" && !isFeatured && slotsLeft > 0;
              return (
                <div
                  key={article.id}
                  className="flex items-center justify-between py-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          article.status === "published"
                            ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                            : "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                        }`}
                      >
                        {article.status === "published" ? "Published" : "Draft"}
                      </span>
                      {isFeatured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          <Star className="h-3 w-3" />
                          Featured #{featuredIndex + 1}
                        </span>
                      )}
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                      >
                        {article.title}
                      </Link>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {article.contentType.replace("-", " ")} ·{" "}
                      {article.category.replace("-", " ")} ·{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(article.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    {article.status === "draft" && (
                      <Link
                        href={`/admin/preview/${article.slug}`}
                        className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    )}
                    {article.status === "published" && (
                      <Link
                        href={`/articles/${article.slug}`}
                        className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    )}
                    <Link
                      href={`/admin/articles/${article.id}`}
                      className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="Edit"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Link>
                    <form
                      action={
                        isFeatured
                          ? clearFeaturedArticle.bind(null, article.id)
                          : canFeature
                          ? setFeaturedArticle.bind(null, article.id)
                          : undefined
                      }
                    >
                      <input type="hidden" name="_csrf" value={csrfToken} />
                      <button
                        type="submit"
                        disabled={!isFeatured && !canFeature}
                        className={`rounded p-1.5 transition-colors ${
                          isFeatured
                            ? "text-amber-500 hover:text-amber-600"
                            : canFeature
                            ? "text-muted-foreground hover:text-amber-500"
                            : "text-muted-foreground/30 cursor-not-allowed"
                        }`}
                        aria-label={isFeatured ? "Unset featured" : canFeature ? "Set featured" : "Max 3 featured"}
                        title={isFeatured ? "Remove from featured" : canFeature ? "Add to featured" : "Max 3 featured (3/3)"}
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    </form>
                    <form
                      action={
                        article.status === "published"
                          ? unpublishArticle.bind(null, article.id)
                          : publishArticle.bind(null, article.id)
                      }
                    >
                      <input type="hidden" name="_csrf" value={csrfToken} />
                      <button
                        type="submit"
                        className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={
                          article.status === "published" ? "Unpublish" : "Publish"
                        }
                      >
                        {article.status === "published" ? (
                          <X className="h-4 w-4" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                    </form>
                    <form action={deleteArticle.bind(null, article.id)}>
                      <input type="hidden" name="_csrf" value={csrfToken} />
                      <button
                        type="submit"
                        className="rounded p-1.5 text-muted-foreground transition-colors hover:text-red-500"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
