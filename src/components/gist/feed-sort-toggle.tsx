import Link from "next/link";
import { Sparkles, Clock } from "lucide-react";

import { cn } from "@/lib/utils";

const sortOptions = [
  { value: "smart", label: "Top", icon: Sparkles },
  { value: "recent", label: "Latest", icon: Clock },
] as const;

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
    <div className="flex items-center justify-end gap-1 border-b border-[var(--border)] px-4 py-2">
      {sortOptions.map((option) => {
        const params = new URLSearchParams();
        if (tag !== "All") {
          params.set("tag", tag);
        }
        if (option.value !== "smart") {
          params.set("sort", option.value);
        }
        const href = params.size > 0 ? `${levelPath}?${params.toString()}` : levelPath;
        const Icon = option.icon;

        return (
          <Link
            key={option.value}
            href={href}
            prefetch={false}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors",
              active === option.value
                ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                : "text-[var(--secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
