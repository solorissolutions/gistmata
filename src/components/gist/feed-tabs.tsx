import Link from "next/link";

import { FEED_LEVELS } from "@/lib/domain/constants";
import { cn } from "@/lib/utils";

export function FeedTabs({ active }: { active: string }) {
  return (
    <div className="sticky-header">
      <div className="flex">
        {FEED_LEVELS.map((level) => {
          const href = level.value === "my-street" ? "/mata" : `/mata/${level.value}`;
          const selected = active === level.value;

          return (
            <Link
              key={level.value}
              href={href}
              prefetch={false}
              className={cn(
                "relative flex flex-1 items-center justify-center py-4 text-[15px] font-medium transition-colors hover:bg-[var(--surface-hover)]",
                selected ? "font-bold text-[var(--foreground)]" : "text-[var(--secondary)]"
              )}
            >
              <span>{level.label}</span>
              {selected && (
                <span className="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-[var(--accent)]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
