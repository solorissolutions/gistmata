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
    <section id="content" className="border-b border-border py-40 sm:py-56">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-base font-medium uppercase tracking-widest text-muted-foreground">
          Interesting Topics
        </h2>
        <div className="mt-12 grid gap-12 sm:grid-cols-3">
          {pillars.map((pillar) => (
            <Link
              key={pillar.key}
              href={pillar.href}
              className="group flex flex-col gap-6 border border-border p-12 transition-colors hover:border-foreground/30"
            >
              <h3 className="text-2xl font-medium tracking-tight text-foreground">
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
