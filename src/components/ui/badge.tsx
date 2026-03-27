import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--chip)] px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-[var(--chip-foreground)] uppercase",
        className,
      )}
      {...props}
    />
  );
}
