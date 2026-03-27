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
  const width = mini ? 44 : compact ? 132 : 168;
  const height = mini ? 44 : compact ? 90 : 114;

  return (
    <Link href={href} className={cn("inline-flex", className)} aria-label="GistMata">
      <img
        src="/logo.png"
        alt="GistMata"
        width={width}
        height={height}
        className={cn(
          "h-auto rounded-[18px] border border-[var(--border)] shadow-sm",
          mini
            ? "w-11 rounded-[14px]"
            : compact
              ? "w-[132px]"
              : "w-[152px] sm:w-[168px]",
        )}
        decoding="async"
      />
    </Link>
  );
}
