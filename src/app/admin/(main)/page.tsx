import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, FileText, Eye, Star } from "lucide-react";
import { parseFeaturedIds } from "@/lib/utils";

export default async function AdminDashboard() {
  const [
    totalArticles,
    publishedArticles,
    draftArticles,
    mediaCount,
    upcomingCount,
    featuredConfig,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "published" } }),
    prisma.article.count({ where: { status: "draft" } }),
    prisma.media.count(),
    prisma.upcoming.count(),
    prisma.siteConfig.findUnique({ where: { id: "default" } }),
  ]);

  const featuredIds = parseFeaturedIds(featuredConfig?.featuredArticleId);
  const featuredArticles = featuredIds.length > 0
    ? await prisma.article.findMany({
        where: { id: { in: featuredIds } },
        select: { id: true, title: true, slug: true },
      })
    : [];

  const recentArticles = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-light tracking-tight">Dashboard</h1>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-1.5 border border-foreground px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          <Plus className="h-3.5 w-3.5" />
          New Article
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-5">
        <div className="border border-border p-5">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="mt-1 text-2xl font-light">{totalArticles}</p>
        </div>
        <div className="border border-border p-5">
          <p className="text-xs text-muted-foreground">Published</p>
          <p className="mt-1 text-2xl font-light">{publishedArticles}</p>
        </div>
        <div className="border border-border p-5">
          <p className="text-xs text-muted-foreground">Drafts</p>
          <p className="mt-1 text-2xl font-light">{draftArticles}</p>
        </div>
        <Link href="/admin/media" className="border border-border p-5 transition-colors hover:border-foreground/30">
          <p className="text-xs text-muted-foreground">Media</p>
          <p className="mt-1 text-2xl font-light">{mediaCount}</p>
        </Link>
        <Link href="/admin/upcoming" className="border border-border p-5 transition-colors hover:border-foreground/30">
          <p className="text-xs text-muted-foreground">Upcoming</p>
          <p className="mt-1 text-2xl font-light">{upcomingCount}</p>
        </Link>
      </div>

      {featuredArticles.length > 0 && (
        <div className="mt-6 border border-amber-500/30 bg-amber-50/50 p-4 dark:bg-amber-950/20">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
            Featured Articles ({featuredArticles.length}/3)
          </p>
          <div className="mt-2 space-y-2">
            {featuredArticles.map((fa, i) => (
              <div key={fa.id} className="flex items-center gap-2">
                <Star className="h-3 w-3 text-amber-500 shrink-0" />
                <span className="text-sm text-foreground">{fa.title}</span>
                <Link
                  href={`/articles/${fa.slug}`}
                  className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-sm font-medium">Recent Articles</h2>
        <div className="mt-4 divide-y divide-border">
          {recentArticles.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No articles yet.
            </p>
          ) : (
            recentArticles.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <Link
                      href={`/admin/articles/${article.id}`}
                      className="text-sm text-foreground transition-colors hover:text-muted-foreground"
                    >
                      {article.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {article.status === "published" ? "Published" : "Draft"}
                      {" · "}
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                      }).format(article.updatedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {article.status === "draft" && (
                    <Link
                      href={`/admin/preview/${article.slug}`}
                      className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                    >
                      Preview
                    </Link>
                  )}
                  <Link
                    href={`/articles/${article.slug}`}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
