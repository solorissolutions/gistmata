import Link from "next/link";

import { OgaV2Header, OgaV2MetricStrip, OgaV2Panel, OgaV2Pill } from "@/components/oga-v2/oga-v2-ui";
import { getOgaDashboardSnapshot } from "@/lib/server/services/oga";
import { compactNumber } from "@/lib/utils";

export default async function OgaV2IntelPage() {
  const snapshot = await getOgaDashboardSnapshot();
  const { epicurus, preIntel } = snapshot;

  return (
    <div className="space-y-5">
      <OgaV2Header
        eyebrow="Oga v2"
        title="Intel"
        description="One operator tool for legal GistMata intelligence. This world groups collection coverage, live early-warning signals, and cross-surface search into a single surface without changing the core product."
      />

      <OgaV2MetricStrip
        items={[
          {
            label: "Raw events",
            value: compactNumber(epicurus.summary.rawEvents),
            hint: `${compactNumber(epicurus.summary.liveSources)} live collection lanes.`,
          },
          {
            label: "Trend alerts",
            value: compactNumber(preIntel.summary.trendAlerts),
            hint: `${compactNumber(preIntel.summary.heatZones)} heat zones under watch.`,
            tone: preIntel.summary.trendAlerts > 0 ? "warning" : "default",
          },
          {
            label: "Watchlist users",
            value: compactNumber(preIntel.summary.watchlistUsers),
            hint: `${compactNumber(epicurus.ingestHealth.fakeLocationReports)} fake-location reports in flow.`,
            tone: preIntel.summary.watchlistUsers > 0 ? "danger" : "default",
          },
          {
            label: "Referral hubs",
            value: compactNumber(preIntel.summary.referralHubs),
            hint: `${compactNumber(epicurus.ingestHealth.pendingInboxIntel)} inbox intel items pending review.`,
          },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <OgaV2Panel title="Intel worlds" eyebrow="Choose a lane">
            <div className="grid gap-4 lg:grid-cols-2">
              <Link
                href="/oga-v2/intel/collection"
                className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4 transition hover:bg-[var(--surface)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">Collection</div>
                  <OgaV2Pill tone="success">{epicurus.summary.liveSources} live</OgaV2Pill>
                </div>
                <div className="mt-2 text-sm leading-6 text-[var(--gm-ink-soft)]">
                  Inspect what the product ingests, what it derives from those sources,
                  and what is blocked by design.
                </div>
              </Link>

              <Link
                href="/oga-v2/intel/live"
                className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4 transition hover:bg-[var(--surface)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">Live signals</div>
                  <OgaV2Pill tone={preIntel.summary.trendAlerts > 0 ? "warning" : "neutral"}>
                    {preIntel.summary.trendAlerts} alerts
                  </OgaV2Pill>
                </div>
                <div className="mt-2 text-sm leading-6 text-[var(--gm-ink-soft)]">
                  Watch the square in motion through heat zones, trend alerts,
                  referral influence, and deep search.
                </div>
              </Link>
            </div>
          </OgaV2Panel>

          <OgaV2Panel title="Why this is separate" eyebrow="Operator framing">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4">
                <div className="font-semibold">Aggregated</div>
                <div className="mt-2 text-sm leading-6 text-[var(--gm-ink-soft)]">
                  Mata, referrals, trust, inbox, and location-quality signals are read together
                  here instead of scattering across the dashboard.
                </div>
              </div>
              <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4">
                <div className="font-semibold">Legal-only</div>
                <div className="mt-2 text-sm leading-6 text-[var(--gm-ink-soft)]">
                  This tool stays inside public content, operator inboxes, survey responses,
                  referrals, and consented platform metadata.
                </div>
              </div>
              <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4">
                <div className="font-semibold">Live subpages</div>
                <div className="mt-2 text-sm leading-6 text-[var(--gm-ink-soft)]">
                  Collection and live signal pages keep their own operational views,
                  but they now live under one Intel entry.
                </div>
              </div>
            </div>
          </OgaV2Panel>
        </div>

        <div className="space-y-5">
          <OgaV2Panel title="Immediate pressure" eyebrow="What needs eyes now">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Collection gaps</span>
                <span className="font-semibold">{epicurus.ingestHealth.missingLocations}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Low-confidence locations</span>
                <span className="font-semibold">{epicurus.ingestHealth.lowConfidenceLocations}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Watchlist users</span>
                <span className="font-semibold">{preIntel.summary.watchlistUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Referral hubs</span>
                <span className="font-semibold">{preIntel.summary.referralHubs}</span>
              </div>
            </div>
          </OgaV2Panel>

          <OgaV2Panel title="Subpage outcomes" eyebrow="What each lane gives oga">
            <div className="space-y-3">
              <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm">
                <div className="font-semibold">Collection</div>
                <div className="mt-1 text-[var(--gm-ink-soft)]">
                  Source inventory, ingest health, and explicit collection boundaries.
                </div>
              </div>
              <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm">
                <div className="font-semibold">Live signals</div>
                <div className="mt-1 text-[var(--gm-ink-soft)]">
                  Heat maps, trend alerts, referral clusters, and searchable behavior patterns.
                </div>
              </div>
            </div>
          </OgaV2Panel>
        </div>
      </div>
    </div>
  );
}
