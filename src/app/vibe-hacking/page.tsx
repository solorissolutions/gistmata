import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CollectionPageSchema } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Vibe Hacking",
  description: "Exploring AI-assisted hacking, cybersecurity, automation, software development, and human-AI collaboration.",
  openGraph: {
    title: "Vibe Hacking — Gistmata",
    description: "Exploring AI-assisted hacking, cybersecurity, automation, and human-AI collaboration.",
  },
};

const PILLAR = {
  key: "vibe-hacking",
  title: "Vibe Hacking",
  description: "Exploring AI-assisted hacking, cybersecurity, automation, software development, and human-AI collaboration.",
  summary: "The rise of AI-assisted creation has transformed how people build software, solve problems, and learn. Vibe Hacking explores this shift and seeks to understand how humans can work alongside AI systems more effectively while operating within legal and ethical boundaries.",
};

export default async function VibeHackingPage() {
  let articles: any[] = [];
  try {
    articles = await prisma.article.findMany({
      where: { status: "published", category: "vibe-hacking" },
      orderBy: { publishedAt: "desc" },
    });
  } catch {}

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <CollectionPageSchema
        title="Vibe Hacking — Gistmata"
        description={PILLAR.description}
      />
      <Breadcrumbs items={[{ label: "Vibe Hacking", href: "/vibe-hacking" }]} />
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
