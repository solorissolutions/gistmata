import { OgaV2Header, OgaV2MetricStrip, OgaV2Panel, OgaV2Pill } from "@/components/oga-v2/oga-v2-ui";
import { getOgaDashboardSnapshot } from "@/lib/server/services/oga";
import { formatTimelineDate } from "@/lib/utils";

export default async function OgaV2SettingsPage() {
  const snapshot = await getOgaDashboardSnapshot();
  const { settings, routeMap } = snapshot;

  return (
    <div className="space-y-5">
      <OgaV2Header
        eyebrow="Oga v2"
        title="Settings"
        description="Flags, audit trail, environment notes, and the route map for the new control room. This is also where the dashboard documents its own constraints and swap posture."
      />

      <OgaV2MetricStrip
        items={[
          {
            label: "Feature flags",
            value: settings.flags.length,
            hint: "Configured in the current store.",
          },
          {
            label: "Audit entries",
            value: settings.auditTrail.length,
            hint: "Latest operator actions.",
          },
          {
            label: "Operator notes",
            value: settings.operatorNotes.length,
            hint: "Current dashboard stance and constraints.",
          },
          {
            label: "Routes",
            value: routeMap.length,
            hint: "New control-room routes now present.",
          },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <OgaV2Panel title="Feature flags" eyebrow="System toggles">
            <div className="space-y-3">
              {settings.flags.map((flag) => (
                <div
                  key={flag.key}
                  className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{flag.key}</span>
                    <OgaV2Pill tone={flag.enabled ? "success" : "neutral"}>
                      {flag.enabled ? "on" : "off"}
                    </OgaV2Pill>
                  </div>
                  <div className="mt-2 text-sm leading-6 text-[var(--gm-ink-soft)]">
                    {flag.description}
                  </div>
                </div>
              ))}
            </div>
          </OgaV2Panel>

          <OgaV2Panel title="Audit trail" eyebrow="Operator actions">
            <div className="space-y-3">
              {settings.auditTrail.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold">{entry.actionType}</span>
                    <span>{formatTimelineDate(entry.createdAt)}</span>
                  </div>
                  <div className="mt-1 text-xs text-[var(--gm-ink-soft)]">
                    {entry.targetType} · {entry.targetId}
                    {entry.notes ? ` · ${entry.notes}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </OgaV2Panel>
        </div>

        <div className="space-y-5">
          <OgaV2Panel title="Environment notes" eyebrow="Runtime">
            <div className="space-y-3">
              {settings.environmentNotes.map((entry) => (
                <div key={entry.label} className="flex items-center justify-between gap-3 text-sm">
                  <span>{entry.label}</span>
                  <span className="font-semibold">{entry.value}</span>
                </div>
              ))}
            </div>
          </OgaV2Panel>

          <OgaV2Panel title="Operator notes" eyebrow="Dashboard stance">
            <div className="space-y-3">
              {settings.operatorNotes.map((note) => (
                <div key={note} className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm leading-6 text-[var(--gm-ink-soft)]">
                  {note}
                </div>
              ))}
            </div>
          </OgaV2Panel>

          <OgaV2Panel title="Route map" eyebrow="New dashboard paths">
            <div className="space-y-3">
              {routeMap.map((route) => (
                <div
                  key={route.href}
                  className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                >
                  <div className="font-semibold">{route.href}</div>
                  <div className="mt-1 text-sm text-[var(--gm-ink-soft)]">{route.description}</div>
                </div>
              ))}
            </div>
          </OgaV2Panel>
        </div>
      </div>
    </div>
  );
}
