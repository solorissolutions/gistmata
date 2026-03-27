import { Card } from "@/components/ui/card";

export function AnalyticsCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="space-y-2">
      <p className="muted-label">{label}</p>
      <div className="text-3xl font-extrabold tracking-[-0.05em]">{value}</div>
      {hint ? <p className="text-sm text-[var(--gm-ink-soft)]">{hint}</p> : null}
    </Card>
  );
}
