import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)] outline-none transition placeholder:text-[var(--input-placeholder)] focus:border-[var(--accent)] focus:outline-2 focus:outline-offset-2 focus:outline-[var(--ring)]",
        className,
      )}
      {...props}
    />
  );
}
