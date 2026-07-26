import { prisma } from "./prisma";

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  contentType: string;
  category: string;
  publishedAt: Date | null;
  rank: number;
}

export async function searchArticles(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  try {
    const results = await prisma.$queryRawUnsafe<SearchResult[]>(
      `SELECT
        id, title, slug, excerpt, "contentType", category, "publishedAt",
        ts_rank(
          to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || content),
          websearch_to_tsquery('english', $1)
        ) AS rank
      FROM "Article"
      WHERE status = 'published'
        AND to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || content)
          @@ websearch_to_tsquery('english', $1)
      ORDER BY rank DESC
      LIMIT 25`,
      query
    );
    if (results.length > 0) return results;
  } catch {}

  const likePattern = `%${query}%`;
  return await prisma.$queryRawUnsafe<SearchResult[]>(
    `SELECT
      id, title, slug, excerpt, "contentType", category, "publishedAt",
      0 AS rank
    FROM "Article"
    WHERE status = 'published'
      AND (title ILIKE $1 OR COALESCE(excerpt, '') ILIKE $1 OR content ILIKE $1)
    ORDER BY "publishedAt" DESC
    LIMIT 25`,
    likePattern
  );
}

export async function searchArticlesByTag(tag: string): Promise<SearchResult[]> {
  const results = await prisma.$queryRawUnsafe<SearchResult[]>(
    `SELECT
      id, title, slug, excerpt, "contentType", category, "publishedAt",
      0 AS rank
    FROM "Article"
    WHERE
      status = 'published'
      AND $1 = ANY(tags)
    ORDER BY "publishedAt" DESC
    LIMIT 10`,
    tag
  );
  return results;
}
