import { PageHeader } from "@/components/blocks/page-header";
import { BroadcastForm } from "@/components/forms/broadcast-form";
import { Card } from "@/components/ui/card";
import { getOgaBroadcastBundle } from "@/lib/server/store";

export default async function OgaBroadcastPage() {
  const data = await getOgaBroadcastBundle();

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Oga" title="Broadcast" description="In-app alert records, survey alerts, and inactivity warning foundation." />
      <Card>
        <BroadcastForm />
      </Card>
      <Card className="space-y-3">
        <p className="muted-label">Recent alerts</p>
        {data.recentAlerts.map((alert) => (
          <div key={alert.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm">
            <div className="font-semibold">{alert.title}</div>
            <div className="text-[var(--gm-ink-soft)]">{alert.body}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}
