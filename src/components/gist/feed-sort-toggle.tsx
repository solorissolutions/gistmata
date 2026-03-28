import Link from "next/link";

import { FEED_SORT_OPTIONS } from "@/lib/domain/constants";
import { cn } from "@/lib/utils";

export function FeedSortToggle({
  active,
  levelPath,
  tag,
}: {
  active: "smart" | "recent";
  levelPath: string;
  tag: string;
}) {
  return (
    <div className="chip-scroll">
      {FEED_SORT_OPTIONS.map((option) => {
        const params = new URLSearchParams();
        if (tag !== "All") {
          params.set("tag", tag);
        }
        if (option.value !== "smart") {
          params.set("sort", option.value);
        }
        const href = params.size > 0 ? `${levelPath}?${params.toString()}` : levelPath;

        return (
          <Link
            key={option.value}
            href={href}
            prefetch={false}
            className={cn(
              "shrink-0 rounded-full border px-3 py-2.5 text-xs font-semibold tracking-[0.08em] transition",
              active === option.value
                ? "border-[var(--accent)] bg-[var(--chip-active)] text-[var(--chip-active-foreground)]"
                : "border-[var(--border)] bg-[var(--chip)] text-[var(--chip-foreground)] hover:bg-[var(--surface-2)]",
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
