import { PageHeader } from "@/components/blocks/page-header";
import { AnalyticsCard } from "@/components/oga/analytics-card";
import { Card } from "@/components/ui/card";
import { getOgaMataBundle } from "@/lib/server/store";

export default async function OgaMataPage() {
  const data = await getOgaMataBundle();

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Oga" title="Mata Monitor" description="Activity by feed level, hot areas, quiet areas, and surging tags." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {data.activityByFeedLevel.map((entry) => (
          <AnalyticsCard key={entry.label} label={entry.label} value={entry.count} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-3">
          <p className="muted-label">Hot areas</p>
          {data.hotAreas.map(([label, count]) => (
            <div key={label} className="flex justify-between text-sm">
              <span>{label}</span>
              <span>{count}</span>
            </div>
          ))}
        </Card>
        <Card className="space-y-3">
          <p className="muted-label">Quiet areas</p>
          {data.quietAreas.map(([label, count]) => (
            <div key={label} className="flex justify-between text-sm">
              <span>{label}</span>
              <span>{count}</span>
            </div>
          ))}
        </Card>
        <Card className="space-y-3">
          <p className="muted-label">Surging tags</p>
          {data.surgingTags.map(([label, count]) => (
            <div key={label} className="flex justify-between text-sm">
              <span>{label}</span>
              <span>{count}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
