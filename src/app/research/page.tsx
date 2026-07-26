import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { WebPageSchema } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Research",
  description: "Exploring theoretical and emerging intelligence systems and novel computational paradigms.",
  openGraph: {
    title: "Research — Gistmata",
    description: "Exploring theoretical and emerging intelligence systems.",
  },
};

export default function ResearchPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
      <WebPageSchema
        title="Research — Gistmata"
        description="Exploring theoretical and emerging intelligence systems and novel computational paradigms."
      />
      <Breadcrumbs items={[{ label: "Research", href: "/research" }]} />
      <h1 className="text-3xl font-light tracking-tight sm:text-4xl font-serif">
        Research
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Exploring theoretical and emerging intelligence systems.
      </p>
      <div className="mt-12 space-y-8">
        <section>
          <h2 className="text-lg font-medium tracking-tight">
            Native Quantum Artificial Intelligence
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            N-QAI is a framework for exploring intelligence systems built on
            quantum architectures rather than classical approximations. This
            research archive will host hypotheses, thought experiments,
            critiques, and evolving models.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium tracking-tight">
            Research Notes
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Short-form explorations of specific ideas, published as they
            develop. These are not formal papers — they are living documents
            open to challenge and refinement.
          </p>
        </section>
      </div>
    </div>
  );
}
