import Link from "next/link";

import { OgaV2Header, OgaV2MetricStrip, OgaV2Panel, OgaV2Pill } from "@/components/oga-v2/oga-v2-ui";
import { getOgaDashboardSnapshot } from "@/lib/server/services/oga";
import { formatTimelineDate } from "@/lib/utils";

export default async function OgaV2MataPage() {
  const snapshot = await getOgaDashboardSnapshot();
  const { mata } = snapshot;

  return (
    <div className="space-y-5">
      <OgaV2Header
        eyebrow="Oga v2"
        title="Mata Monitor"
        description="Watch the square like a live operations feed: heat, rising matas, issue-lane pressure, and quiet places before they turn into blind spots."
      />

      <OgaV2MetricStrip
        items={[
          {
            label: "Hottest matas",
            value: mata.hottestMatters.length,
            hint: "Highest combined signal score across the square.",
          },
          {
            label: "Rising matas",
            value: mata.risingMatters.length,
            hint: "Fresh movement in the last 48 hours.",
          },
          {
            label: "Local spikes",
            value: mata.localSpikes.length,
            hint: "Area/tag combinations moving quickly.",
          },
          {
            label: "Quiet areas",
            value: mata.quietAreas.length,
            hint: "Known places with weak or missing gist flow.",
          },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <OgaV2Panel title="Hottest matas" eyebrow="Right now">
            <div className="space-y-3">
              {mata.hottestMatters.map((matter) => (
                <Link
                  key={matter.id}
                  href={`/oga-v2/matters?matterId=${matter.id}`}
                  className="block rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <OgaV2Pill>{matter.tag}</OgaV2Pill>
                    <OgaV2Pill tone={matter.reportsCount > 0 ? "warning" : "neutral"}>
                      {matter.reportsCount} reports
                    </OgaV2Pill>
                    <OgaV2Pill tone={matter.followUpCount > 0 ? "success" : "neutral"}>
                      {matter.followUpCount} follow-ups
                    </OgaV2Pill>
                  </div>
                  <div className="mt-2 text-sm leading-6">{matter.body}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--gm-ink-soft)]">
                    <span>
                      {matter.areaDisplay}, {matter.stateName}
                    </span>
                    <span>last activity {formatTimelineDate(matter.lastActivityAt)}</span>
                    <span>signal {matter.signalScore}</span>
                  </div>
                </Link>
              ))}
            </div>
          </OgaV2Panel>

          <div className="grid gap-5 lg:grid-cols-2">
            <OgaV2Panel title="Rising matas" eyebrow="Early warnings">
              <div className="space-y-3">
                {mata.risingMatters.map((matter) => (
                  <Link
                    key={matter.id}
                    href={`/oga-v2/matters?matterId=${matter.id}`}
                    className="block rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{matter.tag}</span>
                      <span className="text-xs text-[var(--gm-ink-soft)]">
                        recent signal {matter.recentSignal}
                      </span>
                    </div>
                    <div className="mt-2 text-sm leading-6 text-[var(--gm-ink-soft)]">
                      {matter.body}
                    </div>
                  </Link>
                ))}
              </div>
            </OgaV2Panel>

            <OgaV2Panel title="Issue lanes" eyebrow="Operational lanes">
              <div className="space-y-3">
                {mata.issueLaneCounts.map((lane) => (
                  <div key={lane.tag} className="flex items-center justify-between text-sm">
                    <span>{lane.tag}</span>
                    <span className="font-semibold">{lane.count}</span>
                  </div>
                ))}
              </div>
            </OgaV2Panel>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <OgaV2Panel title="Most-followed matas" eyebrow="Chain growth">
              <div className="space-y-3">
                {mata.mostFollowed.map((matter) => (
                  <div key={matter.id} className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{matter.tag}</span>
                      <span>{matter.followUpCount} follow-ups</span>
                    </div>
                    <div className="mt-2 text-[var(--gm-ink-soft)]">{matter.body}</div>
                  </div>
                ))}
              </div>
            </OgaV2Panel>

            <OgaV2Panel title="Most-saved matas" eyebrow="Attention retention">
              <div className="space-y-3">
                {mata.mostSaved.map((matter) => (
                  <div key={matter.id} className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{matter.tag}</span>
                      <span>{matter.savesCount} saves</span>
                    </div>
                    <div className="mt-2 text-[var(--gm-ink-soft)]">{matter.body}</div>
                  </div>
                ))}
              </div>
            </OgaV2Panel>
          </div>
        </div>

        <div className="space-y-5">
          <OgaV2Panel title="Surging lanes" eyebrow="Recent 7-day pressure">
            <div className="space-y-3">
              {mata.surgingIssueLanes.map(([label, count]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span>{label}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </OgaV2Panel>

          <OgaV2Panel title="Top local spikes" eyebrow="Area x tag">
            <div className="space-y-3">
              {mata.localSpikes.map(([label, count]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span>{label}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </OgaV2Panel>

          <OgaV2Panel title="Quiet places" eyebrow="Coverage gaps">
            <div className="space-y-3">
              {mata.quietAreas.map(([label, count]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span>{label}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </OgaV2Panel>

          <OgaV2Panel title="Most active places" eyebrow="Location pulse">
            <div className="space-y-3">
              {mata.activeLocations.map(([label, count]) => (
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
