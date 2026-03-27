import Link from "next/link";

import { PageHeader } from "@/components/blocks/page-header";
import { AnalyticsCard } from "@/components/oga/analytics-card";
import { Card } from "@/components/ui/card";
import { updateContactMessageStatusV2Action } from "@/lib/server/oga-v2-actions";
import { getOgaInboxBundle } from "@/lib/server/services/oga/inbox-service";
import { formatTimelineDate } from "@/lib/utils";

function statusPillClass(status: "unread" | "read" | "archived") {
  switch (status) {
    case "unread":
      return "bg-amber-100 text-amber-900 border-amber-200";
    case "read":
      return "bg-slate-100 text-slate-800 border-slate-200";
    case "archived":
      return "bg-zinc-100 text-zinc-700 border-zinc-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

function urgencyPillClass(urgency: "routine" | "watch" | "urgent") {
  switch (urgency) {
    case "urgent":
      return "bg-rose-100 text-rose-900 border-rose-200";
    case "watch":
      return "bg-amber-100 text-amber-900 border-amber-200";
    case "routine":
      return "bg-emerald-100 text-emerald-900 border-emerald-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

export default async function OgaInboxPage() {
  const inbox = await getOgaInboxBundle();

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Oga"
        title="Inbox"
        description="Live Contact oga queue. Short-form messages and full intel intake both land here from the real backend."
        actions={(
          <Link
            href="/oga-v2/inbox"
            className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]"
          >
            Open oga v2 inbox
          </Link>
        )}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AnalyticsCard
          label="Unread"
          value={inbox.summary.unreadCount}
          hint="Fresh items waiting for first review."
        />
        <AnalyticsCard
          label="Read"
          value={inbox.summary.readCount}
          hint="Already opened inside oga control."
        />
        <AnalyticsCard
          label="Archived"
          value={inbox.summary.archivedCount}
          hint="Resolved, parked, or closed off."
        />
        <AnalyticsCard
          label="Today"
          value={inbox.summary.todayCount}
          hint="New Contact oga load today."
        />
      </div>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="muted-label">Message queue</p>
            <p className="mt-1 text-sm text-[var(--gm-ink-soft)]">
              Messages are ordered live from Supabase-backed runtime truth, with unread items first.
            </p>
          </div>
          <Link
            href="/contact-oga"
            className="text-sm font-semibold text-[var(--foreground)] underline underline-offset-2"
          >
            Open Contact oga public intake
          </Link>
        </div>

        {inbox.messages.length === 0 ? (
          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-5 text-sm text-[var(--gm-ink-soft)]">
            No Contact oga message yet.
          </div>
        ) : (
          <div className="space-y-4">
            {inbox.messages.map((message) => (
              <div
                key={message.id}
                className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusPillClass(message.status)}`}
                  >
                    {message.status}
                  </span>
                  <span className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-xs font-semibold">
                    {message.category ?? "General"}
                  </span>
                  {message.intel ? (
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${urgencyPillClass(message.intel.urgency)}`}
                    >
                      {message.intel.urgency}
                    </span>
                  ) : null}
                  <span className="text-xs text-[var(--gm-ink-soft)]">
                    {formatTimelineDate(message.createdAt)}
                  </span>
                </div>

                <div className="mt-3 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <p className="muted-label">Identity</p>
                    <p className="mt-1 font-semibold">{message.senderIdentity}</p>
                  </div>
                  <div>
                    <p className="muted-label">State</p>
                    <p className="mt-1 font-semibold">{message.senderState ?? "Unknown"}</p>
                  </div>
                  <div>
                    <p className="muted-label">Tier</p>
                    <p className="mt-1 font-semibold">{message.senderTier ?? "Unknown"}</p>
                  </div>
                  <div>
                    <p className="muted-label">Account Code ref</p>
                    <p className="mt-1 font-semibold">{message.accountCodeReference ?? "None"}</p>
                  </div>
                </div>

                {message.intel ? (
                  <div className="mt-4 rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4 text-sm leading-6">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold">
                        {message.intel.method}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${urgencyPillClass(message.intel.urgency)}`}
                      >
                        {message.intel.urgency}
                      </span>
                    </div>
                    <p className="mt-3">
                      <span className="font-semibold">Summary:</span> {message.intel.summary}
                    </p>
                    {message.intel.locationHint ? (
                      <p className="mt-2">
                        <span className="font-semibold">Location hint:</span> {message.intel.locationHint}
                      </p>
                    ) : null}
                    {message.intel.linkedGistReference ? (
                      <p className="mt-2">
                        <span className="font-semibold">Linked gist/reference:</span>{" "}
                        {message.intel.linkedGistReference}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-4 rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4 text-sm leading-7">
                  {message.body}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {message.status === "unread" ? (
                    <form action={updateContactMessageStatusV2Action}>
                      <input type="hidden" name="messageId" value={message.id} />
                      <input type="hidden" name="status" value="read" />
                      <button className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm font-semibold">
                        Mark as read
                      </button>
                    </form>
                  ) : null}
                  {message.status !== "archived" ? (
                    <form action={updateContactMessageStatusV2Action}>
                      <input type="hidden" name="messageId" value={message.id} />
                      <input type="hidden" name="status" value="archived" />
                      <button className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm font-semibold">
                        Archive
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
