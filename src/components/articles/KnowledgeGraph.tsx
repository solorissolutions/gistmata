import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface Props {
  tags: string[];
  category: string;
  currentSlug: string;
}

export async function KnowledgeGraph({ tags, category, currentSlug }: Props) {
  let connected: Array<{
    tag: string;
    articles: Array<{ slug: string; title: string }>;
  }> = [];

  try {
    if (tags.length > 0) {
      const results = await Promise.all(
        tags.slice(0, 6).map(async (tag) => {
          const articles = await prisma.article.findMany({
            where: {
              status: "published",
              tags: { has: tag },
              slug: { not: currentSlug },
            },
            select: { slug: true, title: true },
            take: 4,
          });
          return articles.length > 0 ? { tag, articles } : null;
        })
      );
      connected = results.filter(Boolean) as typeof connected;
    }
  } catch {
    return null;
  }

  if (connected.length === 0) return null;

  const categoryLink = `/archive?category=${category}`;

  return (
    <section className="mt-16 border-t border-border pt-12">
      <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        Knowledge Graph
      </h2>
      <p className="mt-2 text-xs text-muted-foreground">
        Explore connections between this article and related concepts.
      </p>

      <div className="mt-6 space-y-6">
        {connected.map(({ tag, articles }) => (
          <div key={tag}>
            <Link
              href={`/archive?tag=${encodeURIComponent(tag)}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-border px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              #{tag}
            </Link>
            <div className="mt-2 space-y-1.5">
              {articles.map((a) => (
                <Link
                  key={a.slug}
                  href={`/articles/${a.slug}`}
                  className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="mr-2 text-muted">&#8594;</span>
                  {a.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground">
        <span>Part of</span>
        <Link
          href={categoryLink}
          className="underline underline-offset-2 hover:text-foreground"
        >
          {category.replace("-", " ")} exploration
        </Link>
      </div>
    </section>
  );
}
