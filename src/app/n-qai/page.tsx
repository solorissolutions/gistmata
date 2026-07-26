import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CollectionPageSchema } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "N-QAI",
  description: "Researching theoretical and emerging intelligence systems built on quantum architectures and novel computational paradigms.",
  openGraph: {
    title: "N-QAI — Gistmata",
    description: "Researching theoretical and emerging intelligence systems built on quantum architectures.",
  },
};

const PILLAR = {
  key: "n-qai",
  title: "N-QAI",
  description: "Researching theoretical and emerging intelligence systems built on quantum architectures and novel computational paradigms.",
  summary: "Native Quantum Artificial Intelligence (N-QAI) serves as a framework for exploring intelligence systems built on quantum architectures rather than classical approximations. This research proposes hypotheses that can be challenged, criticized, refined, or rejected.",
};

export default async function NQAIPage() {
  let articles: any[] = [];
  try {
    articles = await prisma.article.findMany({
      where: { status: "published", category: "n-qai" },
      orderBy: { publishedAt: "desc" },
    });
  } catch {}

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <CollectionPageSchema
        title="N-QAI — Gistmata"
        description={PILLAR.description}
      />
      <Breadcrumbs items={[{ label: "N-QAI", href: "/n-qai" }]} />
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
