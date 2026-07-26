"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/html";

interface Props {
  headings: TocEntry[];
}

export function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    for (const { id } of headings) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="sticky top-28"
    >
      <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        On this page
      </h2>
      <ul className="mt-4 space-y-2">
        {headings.map(({ id, text, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`block text-sm transition-colors hover:text-foreground ${
                activeId === id
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
              style={{ paddingLeft: level === 3 ? "1rem" : undefined }}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
