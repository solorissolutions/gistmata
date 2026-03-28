import Link from "next/link";

import { cn } from "@/lib/utils";

export function LogoLockup({
  href = "/",
  className,
  compact = false,
  mini = false,
}: {
  href?: string;
  className?: string;
  compact?: boolean;
  mini?: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={cn("inline-flex", className)}
      aria-label="GistMata"
    >
      <span
        className={cn(
          "inline-flex items-center border border-[var(--border)] bg-[var(--surface)] shadow-sm",
          mini
            ? "h-11 w-11 justify-center rounded-[14px]"
            : compact
              ? "gap-2 rounded-[18px] px-3 py-2"
              : "gap-3 rounded-[22px] px-4 py-3",
        )}
      >
        <span
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-[14px] bg-[var(--accent)] font-black text-[var(--accent-foreground)]",
            mini ? "h-8 w-8 text-[11px]" : compact ? "h-9 w-9 text-xs" : "h-10 w-10 text-sm",
          )}
        >
          GM
        </span>
        {mini ? null : (
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--gm-ink-soft)]">
              Anonymous board
            </span>
            <span
              className={cn(
                "block leading-none font-black tracking-[-0.06em] text-[var(--foreground)]",
                compact ? "text-lg" : "text-[1.7rem]",
              )}
            >
              GistMata
            </span>
          </span>
        )}
      </span>
    </Link>
  );
}
