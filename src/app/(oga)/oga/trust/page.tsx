import { PageHeader } from "@/components/blocks/page-header";
import { ModerationQueueItem } from "@/components/oga/moderation-queue-item";
import { getOgaTrustBundle } from "@/lib/server/store";

export default async function OgaTrustPage() {
  const queue = await getOgaTrustBundle();

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Oga" title="Trust" description="Personal data queue, general reports, fake location flags, and per-user trust snapshot." />
      <div className="grid gap-4 md:grid-cols-4">
        <ModerationQueueItem title="Reports total" detail="All open gist reports across the platform." meta={String(queue.summary.total)} />
        <ModerationQueueItem title="Personal Data" detail="Possible privacy leaks waiting for review." meta={String(queue.summary.personalData)} />
        <ModerationQueueItem title="Fake Location" detail="Claims that location label no match gist reality." meta={String(queue.summary.fakeLocation)} />
        <ModerationQueueItem title="Comot candidates" detail="Accounts trending toward stronger moderation." meta={String(queue.summary.comotCandidates)} />
      </div>
      <div className="space-y-3">
        {queue.items.length === 0 ? (
          <ModerationQueueItem title="Queue calm" detail="No reports yet. Seed data kept clean on purpose." meta="Trust queue empty" />
        ) : (
          queue.items.map((entry) => (
            <ModerationQueueItem
              key={entry.report.id}
              title={`${entry.report.type} · @${entry.author?.username ?? "unknown"}`}
              detail={entry.gist?.body ?? "Missing gist"}
              meta={`${entry.moderationStatus} · trust ${entry.trust?.trustScore ?? 0} · ${entry.report.createdAt}`}
            />
          ))
        )}
      </div>
    </div>
  );
}
