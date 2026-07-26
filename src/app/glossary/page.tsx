import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CollectionPageSchema } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Concept Glossary",
  description: "Browse all concepts and topics covered on Gistmata.",
  openGraph: {
    title: "Concept Glossary — Gistmata",
    description: "Browse all concepts and topics covered across Gistmata.",
  },
};

export default async function GlossaryPage() {
  let tagCounts: Map<string, number> = new Map();

  try {
    const articles = await prisma.article.findMany({
      where: { status: "published" },
      select: { tags: true },
    });

    for (const article of articles) {
      for (const tag of article.tags as string[]) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }
  } catch {}

  const sorted = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <CollectionPageSchema
        title="Concept Glossary — Gistmata"
        description="Browse all concepts and topics covered across Gistmata."
      />
      <Breadcrumbs items={[{ label: "Glossary", href: "/glossary" }]} />
      <h1 className="text-3xl font-light tracking-tight sm:text-4xl font-serif">
        Concept Glossary
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Browse all concepts and topics covered across Gistmata.
      </p>

      {sorted.length === 0 ? (
        <p className="mt-12 text-sm text-muted-foreground">
          No concepts yet. Concepts appear as articles are published with tags.
        </p>
      ) : (
        <>
          <div className="mt-8 flex flex-wrap gap-3">
            {sorted.map(([tag, count]) => (
              <Link
                key={tag}
                href={`/archive?tag=${encodeURIComponent(tag)}`}
                className="group inline-flex items-center gap-2 rounded-full bg-border px-4 py-2 text-sm transition-colors hover:bg-foreground hover:text-background"
              >
                <span>{tag}</span>
                <span className="text-xs text-muted-foreground group-hover:text-background/70">
                  {count}
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              All Concepts
            </h2>
            <div className="mt-4 space-y-2">
              {sorted.map(([tag, count]) => (
                <div
                  key={tag}
                  className="flex items-center justify-between border-b border-border py-2"
                >
                  <Link
                    href={`/archive?tag=${encodeURIComponent(tag)}`}
                    className="text-sm text-foreground transition-colors hover:text-muted-foreground"
                  >
                    {tag}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {count} article{count !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
