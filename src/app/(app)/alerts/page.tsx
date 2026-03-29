import Link from "next/link";
import { Bell } from "lucide-react";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/blocks/page-header";
import { requireUser } from "@/lib/server/services/auth";
import { getUserAlertsBundle } from "@/lib/server/services/alerts";
import { formatTimelineDate } from "@/lib/utils";

export default async function AlertsPage() {
  const viewer = await requireUser();
  const data = await getUserAlertsBundle(viewer);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        eyebrow="Alerts"
        title="Your alerts"
        description="Comments, Mata activity, points, and account notices stay here."
      />
      {data.groupedAlerts.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <Bell className="h-8 w-8 text-[var(--gm-ink-soft)]" aria-hidden="true" />
          <p className="font-semibold">No alerts yet.</p>
          <p className="text-sm text-[var(--gm-ink-soft)]">
            Comments, reactions, and account notices go land here.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.groupedAlerts.map((group) => (
            <Card key={group.title} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold tracking-[-0.04em]">{group.title}</h2>
                <span className="text-sm text-[var(--gm-ink-soft)]">
                  {group.alerts.length}
                </span>
              </div>
              <div className="space-y-3">
                {group.alerts.map((alert) => (
                  <Link
                    key={alert.id}
                    href={alert.link}
                    className="block rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{alert.title}</p>
                        <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
                          {alert.body}
                        </p>
                      </div>
                      <span className="text-xs text-[var(--gm-ink-soft)]">
                        {formatTimelineDate(alert.createdAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
