import Link from "next/link";

import { TOPIC_FILTERS } from "@/lib/domain/constants";
import { cn } from "@/lib/utils";

export function TopicFilters({
  active,
  levelPath,
}: {
  active: string;
  levelPath: string;
}) {
  return (
    <div className="chip-scroll">
      {TOPIC_FILTERS.map((tag) => {
        const href = tag === "All" ? levelPath : `${levelPath}?tag=${encodeURIComponent(tag)}`;
        const selected = active === tag;

        return (
          <Link
            key={tag}
            href={href}
            className={cn(
              "shrink-0 rounded-full border px-3 py-2 text-xs font-semibold tracking-[0.04em] transition",
              selected
                ? "border-[var(--accent)] bg-[var(--chip-active)] text-[var(--chip-active-foreground)]"
                : "border-[var(--border)] bg-[var(--chip)] text-[var(--chip-foreground)] hover:bg-[var(--surface-2)]",
            )}
          >
            {tag}
          </Link>
        );
      })}
    </div>
  );
}
