import { prisma } from "@/lib/prisma";

const BASE_URL = "https://gistmata.com";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  let articles: any[] = [];

  try {
    articles = await prisma.article.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      take: 50,
    });
  } catch {
    // DB unavailable
  }

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
>
  <channel>
    <title>Gistmata</title>
    <link>${BASE_URL}</link>
    <description>A knowledge publication exploring AI-assisted hacking, personal transformation, and emerging intelligence systems.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <ttl>60</ttl>
    ${articles
      .map(
        (article: any) => `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${BASE_URL}/articles/${article.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/articles/${article.slug}</guid>
      <description>${escapeXml(article.excerpt || article.title)}</description>
      <content:encoded><![CDATA[${article.content?.substring(0, 500) || ""}...]]></content:encoded>
      <dc:creator>Gistmata</dc:creator>
      <category>${escapeXml(article.category)}</category>
      ${article.tags?.map((t: string) => `<category>${escapeXml(t)}</category>`).join("\n      ") || ""}
      <pubDate>${article.publishedAt ? new Date(article.publishedAt).toUTCString() : ""}</pubDate>
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
