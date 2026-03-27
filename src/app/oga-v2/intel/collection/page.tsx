import { OgaV2Header, OgaV2MetricStrip, OgaV2Panel, OgaV2Pill } from "@/components/oga-v2/oga-v2-ui";
import { getEpicurusBundle } from "@/lib/server/services/oga/epicurus-service";

export default async function OgaV2IntelCollectionPage() {
  const epicurus = await getEpicurusBundle();

  return (
    <div className="space-y-5">
      <OgaV2Header
        eyebrow="Intel"
        title="Collection"
        description="Collection-layer registry for GistMata’s platform-native intelligence pipeline. This page shows what the product collects from its own public and operator channels, what it derives from those events, and what is intentionally excluded."
      />

      <OgaV2MetricStrip
        items={[
          {
            label: "Live sources",
            value: epicurus.summary.liveSources,
            hint: "Active collection lanes inside the product.",
            tone: "success",
          },
          {
            label: "Blocked sources",
            value: epicurus.summary.blockedSources,
            hint: "Excluded by design for privacy and safety.",
          },
          {
            label: "Raw events",
            value: epicurus.summary.rawEvents,
            hint: "Current event volume across collection lanes.",
          },
          {
            label: "Anomaly signals",
            value: epicurus.summary.anomalySignals,
            hint: "Trend, trust, and watchlist signals requiring review.",
            tone: epicurus.summary.anomalySignals > 0 ? "warning" : "default",
          },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <OgaV2Panel title="Collection sources" eyebrow="What Intel ingests">
            <div className="space-y-3">
              {epicurus.collectionSources.map((source) => (
                <div
                  key={source.id}
                  className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{source.label}</div>
                      <div className="mt-1 text-sm leading-6 text-[var(--gm-ink-soft)]">
                        {source.source}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <OgaV2Pill tone={source.status === "blocked" ? "danger" : "success"}>
                        {source.status}
                      </OgaV2Pill>
                      <OgaV2Pill>{source.eventsCollected} events</OgaV2Pill>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {source.extracted.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </OgaV2Panel>

          <OgaV2Panel title="Pipeline stages" eyebrow="How data moves">
            <div className="grid gap-3 md:grid-cols-2">
              {epicurus.pipelineStages.map((stage) => (
                <div
                  key={stage.stage}
                  className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4"
                >
                  <div className="font-semibold">{stage.stage}</div>
                  <div className="mt-2 text-sm leading-6 text-[var(--gm-ink-soft)]">
                    {stage.note}
                  </div>
                </div>
              ))}
            </div>
          </OgaV2Panel>
        </div>

        <div className="space-y-5">
          <OgaV2Panel title="Ingest health" eyebrow="Collection quality">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Missing user locations</span>
                <span className="font-semibold">{epicurus.ingestHealth.missingLocations}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Low confidence locations</span>
                <span className="font-semibold">{epicurus.ingestHealth.lowConfidenceLocations}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pending inbox intel</span>
                <span className="font-semibold">{epicurus.ingestHealth.pendingInboxIntel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fake-location reports</span>
                <span className="font-semibold">{epicurus.ingestHealth.fakeLocationReports}</span>
              </div>
            </div>
          </OgaV2Panel>

          <OgaV2Panel title="Guardrails" eyebrow="Deliberate exclusions">
            <div className="space-y-3 text-sm leading-6 text-[var(--gm-ink-soft)]">
              <p>Intel collects only platform-native signals: public content, referrals, trust reports, survey participation, and operator inbox submissions.</p>
              <p>It does not collect hidden device telemetry, credentials, third-party messages, or covert location trails.</p>
              <p>This keeps GistMata aligned with anonymous-first product values while still giving oga an early-warning layer for abuse and coordinated misuse.</p>
            </div>
          </OgaV2Panel>
        </div>
      </div>
    </div>
  );
}
