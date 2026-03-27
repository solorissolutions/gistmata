import Link from "next/link";

import { FEED_LEVELS } from "@/lib/domain/constants";
import { cn } from "@/lib/utils";

export function FeedTabs({ active }: { active: string }) {
  return (
    <div className="chip-scroll">
      {FEED_LEVELS.map((level) => {
        const href = level.value === "my-street" ? "/mata" : `/mata/${level.value}`;
        const selected = active === level.value;

        return (
          <Link
            key={level.value}
            href={href}
            className={cn(
              "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition",
              selected
                ? "bg-[var(--chip-active)] text-[var(--chip-active-foreground)]"
                : "border border-[var(--border)] bg-[var(--chip)] text-[var(--chip-foreground)] hover:bg-[var(--surface-2)]",
            )}
          >
            {level.label}
          </Link>
        );
      })}
    </div>
  );
}
