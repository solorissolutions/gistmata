import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CollectionPageSchema } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "The Last Resonance",
  description: "Documenting the pursuit of discipline, identity, growth, and becoming.",
  openGraph: {
    title: "The Last Resonance — Gistmata",
    description: "Documenting the pursuit of discipline, identity, growth, and becoming.",
  },
};

const PILLAR = {
  key: "last-resonance",
  title: "The Last Resonance",
  description: "Documenting the pursuit of discipline, identity, growth, and becoming.",
  summary: "Knowledge is not only about technology. The Last Resonance documents the personal journey of discipline, identity, growth, and becoming — exploring what it means to develop as a human in an age of intelligent machines.",
};

export default async function LastResonancePage() {
  let articles: any[] = [];
  try {
    articles = await prisma.article.findMany({
      where: { status: "published", category: "last-resonance" },
      orderBy: { publishedAt: "desc" },
    });
  } catch {}

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <CollectionPageSchema
        title="The Last Resonance — Gistmata"
        description={PILLAR.description}
      />
      <Breadcrumbs items={[{ label: "The Last Resonance", href: "/last-resonance" }]} />
      <h1 className="text-3xl font-light tracking-tight sm:text-4xl font-serif">
        {PILLAR.title}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground max-w-2xl">
        {PILLAR.description}
      </p>
      <div className="mt-6 border-l-2 border-foreground/20 pl-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {PILLAR.summary}
        </p>
      </div>
      <div className="mt-12 divide-y divide-border">
        {articles.length === 0 ? (
          <p className="py-12 text-sm text-muted-foreground text-center">No articles published in this pillar yet.</p>
        ) : (
          articles.map((article: any) => <ArticleCard key={article.id} article={article} />)
        )}
      </div>
    </div>
  );
}
