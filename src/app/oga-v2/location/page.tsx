import { OgaV2Header, OgaV2MetricStrip, OgaV2Panel } from "@/components/oga-v2/oga-v2-ui";
import { getOgaDashboardSnapshot } from "@/lib/server/services/oga";
import { formatTimelineDate } from "@/lib/utils";

export default async function OgaV2LocationPage() {
  const snapshot = await getOgaDashboardSnapshot();
  const { location } = snapshot;

  return (
    <div className="space-y-5">
      <OgaV2Header
        eyebrow="Oga v2"
        title="Location"
        description="See geography quality clearly: unknown users, weak-confidence assignments, fake-location clustering, and which places are active or quiet."
      />

      <OgaV2MetricStrip
        items={[
          {
            label: "Known users",
            value: location.resolutionHealth.knownUsers,
            hint: "Users with a resolved area label.",
          },
          {
            label: "Unknown users",
            value: location.resolutionHealth.unknownUsers,
            hint: "Users still missing area placement.",
            tone: location.resolutionHealth.unknownUsers > 0 ? "warning" : "default",
          },
          {
            label: "Low confidence",
            value: location.resolutionHealth.lowConfidenceUsers,
            hint: "Assignments below the confidence threshold.",
            tone: location.resolutionHealth.lowConfidenceUsers > 0 ? "warning" : "default",
          },
          {
            label: "Cached places",
            value: location.resolutionHealth.cachedLocations,
            hint: "Location cache volume.",
          },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <OgaV2Panel title="Most active places" eyebrow="Where the square is loud">
              <div className="space-y-3">
                {location.mostActivePlaces.map(([label, count]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span>{label}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </OgaV2Panel>

            <OgaV2Panel title="Quiet places" eyebrow="Coverage gaps">
              <div className="space-y-3">
                {location.quietPlaces.map(([label, count]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span>{label}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </OgaV2Panel>
          </div>

          <OgaV2Panel title="Unknown location cases" eyebrow="Needs resolution">
            <div className="space-y-3">
              {location.unknownUsers.map((user) => (
                <div
                  key={user.id}
                  className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">
                      @{user.username} · {user.state}
                    </span>
                    <span>{formatTimelineDate(user.lastActiveAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </OgaV2Panel>

          <OgaV2Panel title="Weak-confidence assignments" eyebrow="Potentially wrong geography">
            <div className="space-y-3">
              {location.lowConfidenceUsers.map((user) => (
                <div
                  key={user.id}
                  className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">
                      @{user.username} · {user.areaDisplay ?? "Unknown"}, {user.state}
                    </span>
                    <span>{Math.round(user.confidence * 100)}%</span>
                  </div>
                  <div className="mt-1 text-xs text-[var(--gm-ink-soft)]">
                    Last active {formatTimelineDate(user.lastActiveAt)}
                  </div>
                </div>
              ))}
            </div>
          </OgaV2Panel>
        </div>

        <div className="space-y-5">
          <OgaV2Panel title="Suspicious areas" eyebrow="Fake-location pressure">
            <div className="space-y-3">
              {location.suspiciousAreas.map(([label, count]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span>{label}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </OgaV2Panel>

          <OgaV2Panel title="Provider mix" eyebrow="Resolution health">
            <div className="space-y-3">
              {location.providerMix.map(([label, count]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span>{label}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </OgaV2Panel>
        </div>
      </div>
    </div>
  );
}
