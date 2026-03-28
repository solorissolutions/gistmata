import Link from "next/link";

import { OgaV2Empty, OgaV2Header, OgaV2MetricStrip, OgaV2Panel, OgaV2Pill } from "@/components/oga-v2/oga-v2-ui";
import { getOgaUsersBundle } from "@/lib/server/services/oga/user-ops-service";
import { formatTimelineDate } from "@/lib/utils";

export default async function OgaV2UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; state?: string; trust?: string; userId?: string }>;
}) {
  const resolvedSearch = await searchParams;
  const data = await getOgaUsersBundle(resolvedSearch);
  const { summary, filters, options, items: filtered, selectedUserId: selectedId, selectedUser: selected } = data;

  return (
    <div className="space-y-5">
      <OgaV2Header
        eyebrow="Oga v2"
        title="Users"
        description="This is platform oversight, not a profile browser. Search users, inspect trust status, contribution pattern, referral position, and invite-chain impact in platform terms."
      />

      <OgaV2MetricStrip
        items={[
          {
            label: "Filtered users",
            value: summary.filtered,
            hint: `${summary.total} total non-oga users.`,
          },
          {
            label: "Trust watch",
            value: summary.trustWatch,
            hint: "Users with notable trust pressure.",
          },
          {
            label: "Comot-tagged",
            value: summary.comotTagged,
            hint: "Users already flagged by the trust profile.",
          },
          {
            label: "Recent actives",
            value: summary.recentActives,
            hint: "Active in the last 24 hours.",
          },
        ]}
      />

      <OgaV2Panel title="User filters" eyebrow="Oversight">
        <form className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_auto]">
          <input
            type="search"
            name="q"
            defaultValue={filters.q}
            placeholder="Search username, tier, state, area"
            className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)] placeholder:text-[var(--input-placeholder)]"
          />
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
            name="trust"
            defaultValue={filters.trust}
            className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]"
          >
            <option value="all">All trust states</option>
            {options.trustStates.map((option) => (
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
        <OgaV2Panel title="User queue" eyebrow="Operational list">
          {filtered.length === 0 ? (
            <OgaV2Empty
              title="No user matched this filter."
              description="Broaden the search or trust filters to inspect more of the platform."
            />
          ) : (
            <div className="overflow-hidden rounded-[22px] border border-[var(--border)]">
              {filtered.map((user) => (
                <Link
                  key={user.id}
                  href={`/oga-v2/users?q=${encodeURIComponent(
                    filters.q,
                  )}&state=${encodeURIComponent(filters.state)}&trust=${encodeURIComponent(
                    filters.trust,
                  )}&userId=${user.id}`}
                  className={`block border-b border-[var(--border)] px-4 py-4 last:border-b-0 ${
                    user.id === selectedId ? "bg-[var(--surface-2)]" : "bg-[var(--surface)]"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <OgaV2Pill>{user.tier}</OgaV2Pill>
                    {user.trustState !== "Stable" ? (
                      <OgaV2Pill tone="warning">{user.trustState}</OgaV2Pill>
                    ) : null}
                    {user.comotTagged ? <OgaV2Pill tone="danger">comot</OgaV2Pill> : null}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold">
                      @{user.username} · {user.state}
                    </span>
                    <span>{user.pointsBalance} pts</span>
                  </div>
                  <div className="mt-1 text-xs text-[var(--gm-ink-soft)]">
                    {user.gistCount} matters · {user.followUpCount} follow-ups · {user.commentCount} comments · last active{" "}
                    {formatTimelineDate(user.lastActiveAt)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </OgaV2Panel>

        <div className="space-y-5">
          {selected ? (
            <>
              <OgaV2Panel title="Selected user" eyebrow="Platform pattern">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <OgaV2Pill>{selected.tier}</OgaV2Pill>
                    {selected.trustState !== "Stable" ? (
                      <OgaV2Pill tone="warning">{selected.trustState}</OgaV2Pill>
                    ) : (
                      <OgaV2Pill tone="success">stable</OgaV2Pill>
                    )}
                    {selected.comotTagged ? <OgaV2Pill tone="danger">comot tag</OgaV2Pill> : null}
                  </div>
                  <div className="grid gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Location</span>
                      <span className="font-semibold">
                        {selected.areaDisplay ? `${selected.areaDisplay}, ` : ""}
                        {selected.state}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Points</span>
                      <span className="font-semibold">{selected.pointsBalance}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Trust score</span>
                      <span className="font-semibold">{selected.trustScore}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Joined by</span>
                      <span className="font-semibold">
                        {selected.referralParentUsername
                          ? `@${selected.referralParentUsername}`
                          : "seed / root"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Direct invites</span>
                      <span className="font-semibold">{selected.referralChildrenCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total descendants</span>
                      <span className="font-semibold">{selected.totalReferralDescendants}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Referral points</span>
                      <span className="font-semibold">{selected.referralPointsAwarded}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last active</span>
                      <span className="font-semibold">{formatTimelineDate(selected.lastActiveAt)}</span>
                    </div>
                  </div>
                </div>
              </OgaV2Panel>

              <OgaV2Panel title="Platform activity pattern" eyebrow="How this user moves">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Parent matters</span>
                      <span className="font-semibold">{selected.gistCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Follow-up gists</span>
                      <span className="font-semibold">{selected.followUpCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Comments</span>
                      <span className="font-semibold">{selected.commentCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total contributions</span>
                      <span className="font-semibold">{selected.totalContributionCount}</span>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Reports against</span>
                      <span className="font-semibold">{selected.reportsAgainstCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Saved count</span>
                      <span className="font-semibold">{selected.savedCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Referral children</span>
                      <span className="font-semibold">{selected.referralChildrenCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Unused referral supply</span>
                      <span className="font-semibold">{selected.unusedReferralSupply}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Used referral supply</span>
                      <span className="font-semibold">{selected.usedReferralSupply}</span>
                    </div>
                  </div>
                </div>
              </OgaV2Panel>

              <OgaV2Panel title="Referral position" eyebrow="Invite chain">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Tree depth</span>
                      <span className="font-semibold">{selected.treeDepth}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Joined with code</span>
                      <span className="font-semibold">
                        {selected.referralCodeUsed ?? "seed / root"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Parent inviter</span>
                      <span className="font-semibold">
                        {selected.referralParentUsername
                          ? `@${selected.referralParentUsername}`
                          : "none"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Created codes</span>
                      <span className="font-semibold">
                        {selected.usedReferralSupply + selected.unusedReferralSupply}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Unused codes</span>
                      <span className="font-semibold">{selected.unusedReferralSupply}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Referral points</span>
                      <span className="font-semibold">{selected.referralPointsAwarded}</span>
                    </div>
                  </div>
                </div>
              </OgaV2Panel>

              <OgaV2Panel title="Top contribution lanes" eyebrow="Tag signal">
                <div className="space-y-3">
                  {selected.topTags.length === 0 ? (
                    <div className="text-sm leading-6 text-[var(--gm-ink-soft)]">
                      No authored gist tag pattern yet.
                    </div>
                  ) : (
                    selected.topTags.map(([label, count]) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span>{label}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))
                  )}
                </div>
              </OgaV2Panel>

              <OgaV2Panel title="Recent referral codes" eyebrow="Supply issued">
                <div className="space-y-3">
                  {selected.recentReferralCodes.length === 0 ? (
                    <div className="text-sm leading-6 text-[var(--gm-ink-soft)]">
                      This user has not issued referral supply yet.
                    </div>
                  ) : (
                    selected.recentReferralCodes.map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold">{entry.code}</span>
                          <OgaV2Pill
                            tone={
                              entry.status === "used"
                                ? "success"
                                : entry.status === "unused"
                                  ? "neutral"
                                  : "warning"
                            }
                          >
                            {entry.status}
                          </OgaV2Pill>
                        </div>
                        <div className="mt-1 text-xs text-[var(--gm-ink-soft)]">
                          {entry.usedByUsername ? `used by @${entry.usedByUsername}` : "not yet used"} ·{" "}
                          {formatTimelineDate(entry.createdAt)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </OgaV2Panel>

              <OgaV2Panel title="Recent successful invites" eyebrow="Activation log">
                <div className="space-y-3">
                  {selected.recentReferralActivations.length === 0 ? (
                    <div className="text-sm leading-6 text-[var(--gm-ink-soft)]">
                      No successful referral recorded for this user yet.
                    </div>
                  ) : (
                    selected.recentReferralActivations.map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold">@{entry.referredUsername}</span>
                          <OgaV2Pill tone="success">+{entry.pointsAwarded}</OgaV2Pill>
                        </div>
                        <div className="mt-1 text-xs text-[var(--gm-ink-soft)]">
                          {entry.referredState} · {entry.referralCode} · {formatTimelineDate(entry.createdAt)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </OgaV2Panel>
            </>
          ) : (
            <OgaV2Panel title="Selected user" eyebrow="Platform pattern">
              <OgaV2Empty
                title="Choose a user."
                description="Select a row to inspect trust pressure, contribution pattern, and referral position."
              />
            </OgaV2Panel>
          )}
        </div>
      </div>
    </div>
  );
}
