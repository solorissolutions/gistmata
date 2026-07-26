import { CONTENT_TYPES } from "@/lib/utils";

export function ContentTypeBadge({ type }: { type: string }) {
  const config = CONTENT_TYPES[type as keyof typeof CONTENT_TYPES];
  if (!config) return null;
  return (
    <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
      {config.label}
    </span>
  );
}
