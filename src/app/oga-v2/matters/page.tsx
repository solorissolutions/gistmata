import Link from "next/link";

import { OgaV2PinControls } from "@/components/oga-v2/oga-v2-forms";
import { OgaV2Empty, OgaV2Header, OgaV2MetricStrip, OgaV2Panel, OgaV2Pill } from "@/components/oga-v2/oga-v2-ui";
import { moderateGistV2Action } from "@/lib/server/oga-v2-actions";
import { relationLabel } from "@/lib/server/oga-v2";
import { getOgaMattersBundle } from "@/lib/server/services/oga/matter-ops-service";
import { formatTimelineDate } from "@/lib/utils";

export default async function OgaV2MattersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    tag?: string;
    state?: string;
    status?: string;
    matterId?: string;
  }>;
}) {
  const resolvedSearch = await searchParams;
  const data = await getOgaMattersBundle(resolvedSearch);
  const { summary, filters, options, items: filtered, selectedMatterId, selectedMatter } = data;

  return (
    <div className="space-y-5">
      <OgaV2Header
        eyebrow="Oga v2"
        title="Matas"
        description="Search the platform’s live matas, inspect follow-up continuity, pin the matas that should lead the square, and remove or restore only when needed."
      />

      <OgaV2MetricStrip
        items={[
          {
            label: "Filtered matas",
            value: summary.filtered,
            hint: `${summary.total} total mata chains.`,
          },
          {
            label: "Pinned mata slots",
            value: summary.pinned,
            hint: "Up to three slots across the square.",
          },
          {
            label: "Reported matas",
            value: summary.reported,
            hint: "Matas with at least one report.",
          },
          {
            label: "Mata chains",
            value: summary.chains,
            hint: "Parent matas that already have child continuity.",
          },
        ]}
      />

      <OgaV2Panel title="Mata filters" eyebrow="Control surface">
        <form className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.7fr))_auto]">
          <input
            type="search"
            name="q"
            defaultValue={filters.q}
            placeholder="Search mata body, author, tag, area, state"
            className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]"
          />
          <select
            name="tag"
            defaultValue={filters.tag}
            className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]"
          >
            <option value="all">All tags</option>
            {options.tags.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            name="state"
            defaultValue={filters.state}
            className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]"
          >
            <option value="all">All states</option>
            {options.states.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={filters.status}
            className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]"
          >
            {options.statuses.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button className="h-11 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-foreground)]">
            Apply
          </button>
        </form>
      </OgaV2Panel>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <OgaV2Panel title="Mata queue" eyebrow="Operational list">
          {filtered.length === 0 ? (
            <OgaV2Empty
              title="No mata matched this filter."
              description="Broaden the filters or clear the search to inspect more of the square."
            />
          ) : (
            <div className="overflow-hidden rounded-[22px] border border-[var(--border)]">
              {filtered.map((matter) => {
                const href = `/oga-v2/matters?q=${encodeURIComponent(
                  filters.q,
                )}&tag=${encodeURIComponent(filters.tag)}&state=${encodeURIComponent(
                  filters.state,
                )}&status=${encodeURIComponent(filters.status)}&matterId=${matter.id}`;

                return (
                  <Link
                    key={matter.id}
                    href={href}
                    className={`block border-b border-[var(--border)] px-4 py-4 last:border-b-0 ${
                      matter.id === selectedMatterId ? "bg-[var(--surface-2)]" : "bg-[var(--surface)]"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <OgaV2Pill>{matter.tag}</OgaV2Pill>
                      {matter.pinnedPriority ? (
                        <OgaV2Pill tone="success">{`slot ${matter.pinnedPriority}`}</OgaV2Pill>
                      ) : null}
                      {matter.reportsCount > 0 ? (
                        <OgaV2Pill tone="warning">{matter.reportsCount} reports</OgaV2Pill>
                      ) : null}
                      {matter.status === "removed" ? (
                        <OgaV2Pill tone="danger">removed</OgaV2Pill>
                      ) : null}
                    </div>
                    <div className="mt-2 text-sm leading-6">{matter.body}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--gm-ink-soft)]">
                      <span>
                        @{matter.authorUsername} · {matter.areaDisplay}, {matter.stateName}
                      </span>
                      <span>{matter.followUpCount} follow-ups</span>
                      <span>{matter.savesCount} saves</span>
                      <span>{formatTimelineDate(matter.lastActivityAt)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </OgaV2Panel>

        <div className="space-y-5">
          {selectedMatter ? (
            <>
              <OgaV2Panel title="Selected mata" eyebrow="Inspect and act">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <OgaV2Pill>{selectedMatter.tag}</OgaV2Pill>
                    <OgaV2Pill tone={selectedMatter.reportsCount > 0 ? "warning" : "neutral"}>
                      {selectedMatter.reportsCount} reports
                    </OgaV2Pill>
                    <OgaV2Pill tone={selectedMatter.followUpCount > 0 ? "success" : "neutral"}>
                      {selectedMatter.followUpCount} follow-ups
                    </OgaV2Pill>
                  </div>

                  <div className="text-sm leading-6">{selectedMatter.body}</div>

                  <div className="grid gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Author</span>
                      <span className="font-semibold">
                        @{selectedMatter.authorUsername} · {selectedMatter.authorTier}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Trust state</span>
                      <span className="font-semibold">{selectedMatter.moderationState}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Location</span>
                      <span className="font-semibold">
                        {selectedMatter.areaDisplay}, {selectedMatter.stateName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Signal</span>
                      <span className="font-semibold">{selectedMatter.signalScore}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="muted-label">Pin control</div>
                    <OgaV2PinControls
                      gistId={selectedMatter.id}
                      pinnedPriority={selectedMatter.pinnedPriority as 1 | 2 | 3 | null}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <form action={moderateGistV2Action}>
                      <input type="hidden" name="gistId" value={selectedMatter.id} />
                      <input
                        type="hidden"
                        name="status"
                        value={selectedMatter.status === "active" ? "removed" : "active"}
                      />
                      <button className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm font-semibold">
                        {selectedMatter.status === "active" ? "Remove mata" : "Restore mata"}
                      </button>
                    </form>
                  </div>
                </div>
              </OgaV2Panel>

              <OgaV2Panel title="Linked follow-up gists" eyebrow="Mata continuity">
                {selectedMatter.followUps.length === 0 ? (
                  <OgaV2Empty
                    title="No linked follow-up yet."
                    description="This mata is still standing alone. Keep watching for confirmations, counters, and updates."
                  />
                ) : (
                  <div className="space-y-3">
                    {selectedMatter.followUps.map((followUp) => (
                      <div
                        key={followUp.id}
                        className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <OgaV2Pill>{relationLabel(followUp.relationType)}</OgaV2Pill>
                          {followUp.status === "removed" ? (
                            <OgaV2Pill tone="danger">removed</OgaV2Pill>
                          ) : null}
                        </div>
                        <div className="mt-2 text-sm leading-6">{followUp.body}</div>
                        <div className="mt-2 text-xs text-[var(--gm-ink-soft)]">
                          @{followUp.authorUsername} · {followUp.areaDisplay}, {followUp.stateName} ·{" "}
                          {formatTimelineDate(followUp.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </OgaV2Panel>
            </>
          ) : (
            <OgaV2Panel title="Selected mata" eyebrow="Inspect and act">
              <OgaV2Empty
                title="Choose a mata."
                description="Select a row from the mata queue to inspect follow-ups, pin slots, or remove and restore."
              />
            </OgaV2Panel>
          )}
        </div>
      </div>
    </div>
  );
}
