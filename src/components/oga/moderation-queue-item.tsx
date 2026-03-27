import { Card } from "@/components/ui/card";

export function ModerationQueueItem({
  title,
  detail,
  meta,
}: {
  title: string;
  detail: string;
  meta: string;
}) {
  return (
    <Card className="space-y-2">
      <h3 className="text-lg font-extrabold tracking-[-0.04em]">{title}</h3>
      <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">{detail}</p>
      <p className="text-xs text-[var(--gm-ink-soft)]">{meta}</p>
    </Card>
  );
}
