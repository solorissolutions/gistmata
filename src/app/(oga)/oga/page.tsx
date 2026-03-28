import { PageHeader } from "@/components/blocks/page-header";
import { AnalyticsCard } from "@/components/oga/analytics-card";
import { Card } from "@/components/ui/card";
import { getOgaOverviewBundle } from "@/lib/server/store";

export default async function OgaOverviewPage() {
  const data = await getOgaOverviewBundle();

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Oga"
        title="Overview"
        description="Clean first-pass platform operations for the anonymous Mata."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <AnalyticsCard label="Users total" value={data.metrics.totalUsers} />
        <AnalyticsCard label="Active now" value={data.metrics.activeNow} />
        <AnalyticsCard label="New joins" value={data.metrics.newJoins} />
        <AnalyticsCard label="Gist volume" value={data.metrics.gistVolume} />
        <AnalyticsCard label="Comment volume" value={data.metrics.commentVolume} />
        <AnalyticsCard label="Reports open" value={data.metrics.reportsOpen} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="space-y-4">
          <h2 className="text-2xl font-extrabold tracking-[-0.05em]">Market mix</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="muted-label">Top states</p>
              {data.topStates.map(([state, count]) => (
                <div key={state} className="flex justify-between text-sm">
                  <span>{state}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="muted-label">Top areas</p>
              {data.topAreas.map(([area, count]) => (
                <div key={area} className="flex justify-between text-sm">
                  <span>{area}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="muted-label">Top tags</p>
              {data.topTags.map(([tag, count]) => (
                <div key={tag} className="flex justify-between text-sm">
                  <span>{tag}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-3">
          <p className="muted-label">Report backlog</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Personal Data</span>
              <span>{data.reportBacklog.personalData}</span>
            </div>
            <div className="flex justify-between">
              <span>Fake Location</span>
              <span>{data.reportBacklog.fakeLocation}</span>
            </div>
            <div className="flex justify-between">
              <span>General</span>
              <span>{data.reportBacklog.general}</span>
            </div>
          </div>
        </Card>
        <Card className="space-y-3">
          <p className="muted-label">Location health</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Known users</span>
              <span>{data.locationHealth.knownUsers}</span>
            </div>
            <div className="flex justify-between">
              <span>Low confidence</span>
              <span>{data.locationHealth.lowConfidence}</span>
            </div>
            <div className="flex justify-between">
              <span>Cached locations</span>
              <span>{data.locationHealth.cachedLocations}</span>
            </div>
          </div>
        </Card>
        <Card className="space-y-3">
          <p className="muted-label">Member mix</p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            <div className="space-y-2">
              {data.ageMix.map(([label, count]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span>{label}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {data.genderMix.map(([label, count]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span>{label}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
