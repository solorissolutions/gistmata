import { PageHeader } from "@/components/blocks/page-header";
import { AnalyticsCard } from "@/components/oga/analytics-card";
import { Card } from "@/components/ui/card";
import { getOgaLocationBundle } from "@/lib/server/store";

export default async function OgaLocationPage() {
  const data = await getOgaLocationBundle();

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Oga" title="Location" description="Resolution health, low-confidence locals, and cached place labels." />
      <div className="grid gap-4 md:grid-cols-3">
        <AnalyticsCard label="Known users" value={data.resolutionHealth.knownUsers} />
        <AnalyticsCard label="Unknown users" value={data.resolutionHealth.unknownUsers} />
        <AnalyticsCard label="Cached locations" value={data.resolutionHealth.cachedLocations} />
      </div>
      <Card className="space-y-3">
        <p className="muted-label">Cached labels</p>
        {data.cachedLocations.slice(0, 10).map((location) => (
          <div key={location.id} className="flex justify-between text-sm">
            <span>
              {location.displayLocality}, {location.stateName}
            </span>
            <span>{location.confidenceScore}</span>
          </div>
        ))}
      </Card>
      <Card className="space-y-3">
        <p className="muted-label">Provider mix</p>
        {data.providerMix.map(([provider, count]) => (
          <div key={provider} className="flex justify-between text-sm">
            <span>{provider}</span>
            <span>{count}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
