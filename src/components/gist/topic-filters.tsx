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
    <div className="border-b border-[var(--border)] px-4">
      <div className="chip-scroll py-3">
        {TOPIC_FILTERS.map((tag) => {
          const href = tag === "All" ? levelPath : `${levelPath}?tag=${encodeURIComponent(tag)}`;
          const selected = active === tag;

          return (
            <Link
              key={tag}
              href={href}
              prefetch={false}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold transition-colors",
                selected
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                  : "bg-[var(--surface-soft)] text-[var(--foreground)] hover:bg-[var(--surface-2)]"
              )}
            >
              {tag}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
