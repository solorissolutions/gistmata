import Link from "next/link";
import { ArrowRight } from "lucide-react";

const pillars = [
  {
    key: "vibe-hacking",
    title: "Vibe Hacking",
    description:
      "Exploring AI-assisted hacking, cybersecurity, automation, software development, and human-AI collaboration.",
    href: "/archive?category=vibe-hacking",
  },
  {
    key: "last-resonance",
    title: "The Last Resonance",
    description:
      "Documenting the pursuit of discipline, identity, growth, and becoming.",
    href: "/archive?category=last-resonance",
  },
  {
    key: "n-qai",
    title: "N-QAI",
    description:
      "Researching theoretical and emerging intelligence systems built on quantum architectures and novel computational paradigms.",
    href: "/archive?category=n-qai",
  },
];

export function Pillars() {
  return (
    <section id="content" className="border-b border-border py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Explore by Pillar
        </h2>
        <p className="mt-2 font-serif text-2xl tracking-tight text-foreground sm:text-3xl">
          Three threads of inquiry
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {pillars.map((pillar) => (
            <Link
              key={pillar.key}
              href={pillar.href}
              className="group flex flex-col gap-4 border border-border bg-card p-8 transition-colors hover:border-foreground/40"
            >
              <h3 className="font-serif text-2xl tracking-tight text-foreground">
                {pillar.title}
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                {pillar.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors group-hover:text-muted-foreground">
                Browse articles
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
