import { prisma } from "@/lib/prisma";
import { parseFeaturedIds, encodeFeaturedIds } from "@/lib/utils";
import { Hero } from "@/components/home/Hero";
import { WhatIsGistmata } from "@/components/home/WhatIsGistmata";
import { Pillars } from "@/components/home/Pillars";
import { CurrentlyBuilding } from "@/components/home/CurrentlyBuilding";
import { Upcoming } from "@/components/home/Upcoming";
import { WebPageSchema } from "@/components/StructuredData";

export default async function HomePage() {
  let config = null;
  let upcomingItems: any[] = [];
  let published: any[] = [];
  let featured: any[] = [];

  try {
    const results = await Promise.all([
      prisma.siteConfig.findUnique({ where: { id: "default" } }),
      prisma.upcoming.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.article.findMany({
        where: { status: "published" },
        orderBy: { publishedAt: "desc" },
        take: 10,
      }),
    ]);
    config = results[0];
    upcomingItems = results[1];
    published = results[2];

    const featuredIds = parseFeaturedIds(config?.featuredArticleId);
    if (featuredIds.length > 0) {
      const featuredArticles = await prisma.article.findMany({
        where: { id: { in: featuredIds }, status: "published" },
      });
      const ordered = featuredIds
        .map((id) => featuredArticles.find((a) => a.id === id))
        .filter(Boolean);

      // Clean up stale IDs that point to deleted/unpublished articles
      const validIds = ordered.map((a: any) => a.id);
      if (validIds.length !== featuredIds.length) {
        await prisma.siteConfig.update({
          where: { id: "default" },
          data: { featuredArticleId: validIds.length > 0 ? encodeFeaturedIds(validIds) : null },
        });
      }

      featured = ordered;
    }
  } catch {
    // Database not available during build
  }

  const latest = published.filter(
    (a) => !featured.some((f: any) => f?.id === a.id)
  );

  return (
    <>
      <WebPageSchema
        title="Gistmata — Knowledge Through Exploration"
        description="A knowledge publication exploring AI-assisted hacking, personal transformation, and emerging intelligence systems."
      />
      <Hero featured={featured} latest={latest.slice(0, 6)} />
      <Pillars />
      <WhatIsGistmata />
      <CurrentlyBuilding />
      <Upcoming items={upcomingItems} />
    </>
  );
}
