import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { WebPageSchema } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about Gistmata and its mission.",
  openGraph: {
    title: "About — Gistmata",
    description: "Learn more about Gistmata and its mission.",
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
      <WebPageSchema
        title="About — Gistmata"
        description="Learn more about Gistmata and its mission."
      />
      <Breadcrumbs items={[{ label: "About", href: "/about" }]} />
      <h1 className="text-3xl font-light tracking-tight sm:text-4xl font-serif">
        About
      </h1>
      <div className="mt-8 space-y-5 text-base leading-relaxed sm:text-lg">
        <p>
          Gistmata was created to explore ideas that sit at the edge of
          technology, intelligence, and human development.
        </p>
        <p className="text-muted-foreground">
          The rise of AI-assisted creation has transformed how people build
          software, solve problems, and learn. Vibe Hacking explores this shift
          and seeks to understand how humans can work alongside AI systems more
          effectively while operating within legal and ethical boundaries.
        </p>
        <p className="text-muted-foreground">
          Gistmata also exists because of a belief that future forms of
          intelligence may emerge from principles beyond today&apos;s dominant
          architectures. Native Quantum Artificial Intelligence (N-QAI) serves
          as a framework for exploring these possibilities, proposing hypotheses
          that can be challenged, criticized, refined, or rejected.
        </p>
        <p className="text-muted-foreground">
          At the same time, knowledge is not only about technology. The Last
          Resonance documents the personal journey of discipline, identity,
          growth, and becoming.
        </p>
      </div>
    </div>
  );
}
