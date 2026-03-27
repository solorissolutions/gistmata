import Link from "next/link";

import { OgaV2Empty, OgaV2Header, OgaV2MetricStrip, OgaV2Panel, OgaV2Pill } from "@/components/oga-v2/oga-v2-ui";
import { moderateGistV2Action } from "@/lib/server/oga-v2-actions";
import { getOgaDashboardSnapshot } from "@/lib/server/services/oga";
import { formatTimelineDate } from "@/lib/utils";

export default async function OgaV2TrustPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; reportId?: string }>;
}) {
  const snapshot = await getOgaDashboardSnapshot();
  const resolvedSearch = await searchParams;
  const type = resolvedSearch.type ?? "all";
  const filteredQueue = snapshot.trust.queue.filter(
    (item) => type === "all" || item.type === type,
  );
  const selectedId =
    filteredQueue.find((item) => item.id === resolvedSearch.reportId)?.id ??
    filteredQueue[0]?.id ??
    null;
  const selected = filteredQueue.find((item) => item.id === selectedId) ?? null;

  return (
    <div className="space-y-5">
      <OgaV2Header
        eyebrow="Oga v2"
        title="Trust"
        description="Moderation power should stay fair and legible: see the queue, inspect context, understand user risk, and act with enough information to avoid blind deletion."
      />

      <OgaV2MetricStrip
        items={[
          {
            label: "Queue total",
            value: snapshot.trust.summary.total,
            hint: `${snapshot.trust.summary.unresolved} still pending action.`,
          },
          {
            label: "Personal data",
            value: snapshot.trust.summary.personalData,
            hint: "Potential privacy leaks.",
            tone: snapshot.trust.summary.personalData > 0 ? "danger" : "default",
          },
          {
            label: "Fake location",
            value: snapshot.trust.summary.fakeLocation,
            hint: "Geography trust risk.",
            tone: snapshot.trust.summary.fakeLocation > 0 ? "warning" : "default",
          },
          {
            label: "Comot candidates",
            value: snapshot.trust.summary.comotCandidates,
            hint: "Users close to stronger action.",
            tone: snapshot.trust.summary.comotCandidates > 0 ? "warning" : "default",
          },
        ]}
      />

      <OgaV2Panel title="Queue filters" eyebrow="Moderation lane">
        <form className="flex flex-wrap gap-3">
          <select
            name="type"
            defaultValue={type}
            className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]"
          >
            <option value="all">All reports</option>
            <option value="personal-data">Personal data</option>
            <option value="fake-location">Fake location</option>
            <option value="general">General</option>
          </select>
          <button className="h-11 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-foreground)]">
            Apply
          </button>
        </form>
      </OgaV2Panel>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <OgaV2Panel title="Trust queue" eyebrow="Report backlog">
          {filteredQueue.length === 0 ? (
            <OgaV2Empty
              title="Queue is clear for this filter."
              description="No reports are currently matching this moderation lane."
            />
          ) : (
            <div className="overflow-hidden rounded-[22px] border border-[var(--border)]">
              {filteredQueue.map((item) => (
                <Link
                  key={item.id}
                  href={`/oga-v2/trust?type=${encodeURIComponent(type)}&reportId=${item.id}`}
                  className={`block border-b border-[var(--border)] px-4 py-4 last:border-b-0 ${
                    item.id === selectedId ? "bg-[var(--surface-2)]" : "bg-[var(--surface)]"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <OgaV2Pill tone={item.type === "personal-data" ? "danger" : item.type === "fake-location" ? "warning" : "neutral"}>
                      {item.type}
                    </OgaV2Pill>
                    <OgaV2Pill tone={item.adjudicationState === "Pending" ? "warning" : "neutral"}>
                      {item.adjudicationState}
                    </OgaV2Pill>
                  </div>
                  <div className="mt-2 text-sm leading-6">{item.gistBody}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--gm-ink-soft)]">
                    <span>@{item.authorUsername}</span>
                    <span>{item.areaDisplay}</span>
                    <span>{formatTimelineDate(item.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </OgaV2Panel>

        <div className="space-y-5">
          {selected ? (
            <OgaV2Panel title="Selected report" eyebrow="Fair action context">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <OgaV2Pill tone={selected.type === "personal-data" ? "danger" : selected.type === "fake-location" ? "warning" : "neutral"}>
                    {selected.type}
                  </OgaV2Pill>
                  <OgaV2Pill>{selected.moderationState}</OgaV2Pill>
                  <OgaV2Pill tone={selected.gistStatus === "removed" ? "danger" : "neutral"}>
                    {selected.gistStatus}
                  </OgaV2Pill>
                </div>
                <div className="space-y-2 text-sm leading-6">
                  <div>{selected.gistBody}</div>
                  {selected.reasonText ? (
                    <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3 text-[var(--gm-ink-soft)]">
                      Reporter note: {selected.reasonText}
                    </div>
                  ) : null}
                </div>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Author</span>
                    <span className="font-semibold">
                      @{selected.authorUsername} · {selected.authorTier}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Trust score</span>
                    <span className="font-semibold">{selected.authorTrustScore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Area</span>
                    <span className="font-semibold">
                      {selected.areaDisplay}, {selected.stateName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reporter</span>
                    <span className="font-semibold">@{selected.reporterUsername}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reported</span>
                    <span className="font-semibold">{formatTimelineDate(selected.createdAt)}</span>
                  </div>
                </div>
                {selected.gistId ? (
                  <form action={moderateGistV2Action}>
                    <input type="hidden" name="gistId" value={selected.gistId} />
                    <input
                      type="hidden"
                      name="status"
                      value={selected.gistStatus === "active" ? "removed" : "active"}
                    />
                    <button className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm font-semibold">
                      {selected.gistStatus === "active" ? "Remove gist" : "Restore gist"}
                    </button>
                  </form>
                ) : null}
              </div>
            </OgaV2Panel>
          ) : (
            <OgaV2Panel title="Selected report" eyebrow="Fair action context">
              <OgaV2Empty
                title="Choose a report."
                description="Pick a queue item to inspect the gist, author risk, and adjudication context."
              />
            </OgaV2Panel>
          )}

          <OgaV2Panel title="Users near penalties" eyebrow="Watchlist">
            <div className="space-y-3">
              {snapshot.trust.riskUsers.map((user) => (
                <div key={user.id} className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">
                      @{user.username} · {user.state}
                    </span>
                    <span>{user.trustScore}</span>
                  </div>
                  <div className="mt-1 text-[var(--gm-ink-soft)]">
                    {user.trustState} · {user.personalDataStrikes} privacy · {user.fakeLocationStrikes} location
                  </div>
                </div>
              ))}
            </div>
          </OgaV2Panel>

          <OgaV2Panel title="Trust trends" eyebrow="Where pressure is clustering">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-3">
                <div className="muted-label">By area</div>
                {snapshot.trust.areaTrends.map(([label, count]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span>{label}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="muted-label">By tag</div>
                {snapshot.trust.tagTrends.map(([label, count]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span>{label}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </OgaV2Panel>
        </div>
      </div>
    </div>
  );
}
