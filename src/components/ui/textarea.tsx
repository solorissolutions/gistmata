import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-40 w-full rounded-[24px] border border-[var(--border)] bg-[var(--input)] px-4 py-4 text-sm text-[var(--input-foreground)] outline-none transition placeholder:text-[var(--input-placeholder)] focus:border-[var(--accent)] focus:outline-2 focus:outline-offset-2 focus:outline-[var(--ring)]",
        className,
      )}
      {...props}
    />
  );
}
