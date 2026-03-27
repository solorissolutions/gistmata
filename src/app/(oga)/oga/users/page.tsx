import { PageHeader } from "@/components/blocks/page-header";
import { Card } from "@/components/ui/card";
import { getOgaUsersBundle } from "@/lib/server/store";

export default async function OgaUsersPage() {
  const users = await getOgaUsersBundle();

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Oga" title="Users" description="Search-ready private user list with tier, points, state, and moderation summary." />
      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id} className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">
                  @{user.username} · {user.state}
                </p>
                <p className="text-xs text-[var(--gm-ink-soft)]">
                  {user.tier} · {user.pointsBalance} pts · {user.ageRange} · {user.gender}
                </p>
                <p className="mt-1 text-xs text-[var(--gm-ink-soft)]">
                  Referral:{" "}
                  {user.referredByUsername
                    ? `@${user.referredByUsername} via ${user.referralCodeUsed ?? "unknown"}`
                    : "Seed root / no lineage"}
                </p>
              </div>
              <div className="text-right text-sm text-[var(--gm-ink-soft)]">
                <div>Trust {user.trust?.trustScore ?? 0}</div>
                <div>{user.moderationStatus}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
