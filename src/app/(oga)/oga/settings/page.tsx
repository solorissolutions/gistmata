import { PageHeader } from "@/components/blocks/page-header";
import { Card } from "@/components/ui/card";
import { getOgaSettingsBundle } from "@/lib/server/store";

export default async function OgaSettingsPage() {
  const data = await getOgaSettingsBundle();

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Oga" title="Settings / audit" description="Feature flags, system notes, and recent operator trail." />
      <Card className="space-y-3">
        <p className="muted-label">Feature flags</p>
        {data.flags.map((flag) => (
          <div key={flag.key} className="flex justify-between text-sm">
            <span>{flag.key}</span>
            <span>{flag.enabled ? "On" : "Off"}</span>
          </div>
        ))}
      </Card>
      <Card className="space-y-3">
        <p className="muted-label">Audit trail</p>
        {data.auditTrail.map((entry) => (
          <div key={entry.id} className="flex justify-between gap-3 text-sm">
            <span>{entry.actionType}</span>
            <span className="text-[var(--gm-ink-soft)]">{entry.createdAt}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
