import Link from "next/link";

import { OgaV2Empty, OgaV2Header, OgaV2MetricStrip, OgaV2Panel, OgaV2Pill } from "@/components/oga-v2/oga-v2-ui";
import { updateContactMessageStatusV2Action } from "@/lib/server/oga-v2-actions";
import { getOgaInboxBundle } from "@/lib/server/services/oga/inbox-service";
import { formatTimelineDate } from "@/lib/utils";

export default async function OgaV2InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ messageId?: string; status?: string }>;
}) {
  const resolvedSearch = await searchParams;
  const data = await getOgaInboxBundle(resolvedSearch);
  const { summary, filters, messages: filtered, selectedMessageId: selectedId, selectedMessage: selected } = data;

  return (
    <div className="space-y-5">
      <OgaV2Header
        eyebrow="Oga v2"
        title="Inbox"
        description="Contact oga messages are now first-class in the dashboard: unread count, list, detail, platform identity only, and quick read/archive actions."
      />

      <OgaV2MetricStrip
        items={[
          {
            label: "Unread",
            value: summary.unreadCount,
            hint: "Messages that still need first review.",
            tone: summary.unreadCount > 0 ? "warning" : "default",
          },
          {
            label: "Read",
            value: summary.readCount,
            hint: "Already opened in the control room.",
          },
          {
            label: "Archived",
            value: summary.archivedCount,
            hint: "Resolved or parked.",
          },
          {
            label: "Today",
            value: summary.todayCount,
            hint: "Fresh Contact oga load today.",
          },
        ]}
      />

      <OgaV2Panel title="Inbox filters" eyebrow="Message queue">
        <form className="flex flex-wrap gap-3">
          <select
            name="status"
            defaultValue={filters.status}
            className="h-11 rounded-2xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--input-foreground)]"
          >
            <option value="all">All messages</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>
          <button className="h-11 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-foreground)]">
            Apply
          </button>
        </form>
      </OgaV2Panel>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <OgaV2Panel title="Message list" eyebrow="Contact oga">
          {filtered.length === 0 ? (
            <OgaV2Empty
              title="No message in this lane."
              description="There is nothing matching the selected inbox status."
            />
          ) : (
            <div className="overflow-hidden rounded-[22px] border border-[var(--border)]">
              {filtered.map((message) => (
                <Link
                  key={message.id}
                  href={`/oga-v2/inbox?status=${encodeURIComponent(filters.status)}&messageId=${message.id}`}
                  className={`block border-b border-[var(--border)] px-4 py-4 last:border-b-0 ${
                    message.id === selectedId ? "bg-[var(--surface-2)]" : "bg-[var(--surface)]"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <OgaV2Pill tone={message.status === "unread" ? "warning" : "neutral"}>
                      {message.status}
                    </OgaV2Pill>
                    {message.category ? <OgaV2Pill>{message.category}</OgaV2Pill> : null}
                    {message.intel ? (
                      <OgaV2Pill tone={message.intel.urgency === "urgent" ? "warning" : "neutral"}>
                        {message.intel.urgency}
                      </OgaV2Pill>
                    ) : null}
                  </div>
                  <div className="mt-2 text-sm font-semibold">
                    {message.senderIdentity}
                    {message.senderState ? ` · ${message.senderState}` : ""}
                  </div>
                  <div className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--gm-ink-soft)]">
                    {message.body}
                  </div>
                  <div className="mt-2 text-xs text-[var(--gm-ink-soft)]">
                    {formatTimelineDate(message.createdAt)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </OgaV2Panel>

        <div className="space-y-5">
          {selected ? (
            <OgaV2Panel title="Message detail" eyebrow="Read and resolve">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <OgaV2Pill tone={selected.status === "unread" ? "warning" : "neutral"}>
                    {selected.status}
                  </OgaV2Pill>
                  {selected.category ? <OgaV2Pill>{selected.category}</OgaV2Pill> : null}
                </div>

                <div className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Sender identity</span>
                    <span className="font-semibold">{selected.senderIdentity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Platform state</span>
                    <span className="font-semibold">{selected.senderState ?? "Unknown"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Platform tier</span>
                    <span className="font-semibold">{selected.senderTier ?? "Unknown"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Received</span>
                    <span className="font-semibold">{formatTimelineDate(selected.createdAt)}</span>
                  </div>
                </div>

                {selected.accountCodeReference ? (
                  <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3 text-sm">
                    Account Code reference: {selected.accountCodeReference}
                  </div>
                ) : null}

                {selected.intel ? (
                  <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4 text-sm">
                    <div className="flex flex-wrap gap-2">
                      <OgaV2Pill>{selected.intel.method}</OgaV2Pill>
                      <OgaV2Pill tone={selected.intel.urgency === "urgent" ? "warning" : "neutral"}>
                        {selected.intel.urgency}
                      </OgaV2Pill>
                    </div>
                    <div className="mt-3 space-y-2 leading-6">
                      <p>
                        <span className="font-semibold">Summary:</span> {selected.intel.summary}
                      </p>
                      {selected.intel.locationHint ? (
                        <p>
                          <span className="font-semibold">Location hint:</span>{" "}
                          {selected.intel.locationHint}
                        </p>
                      ) : null}
                      {selected.intel.linkedGistReference ? (
                        <p>
                          <span className="font-semibold">Linked gist/reference:</span>{" "}
                          {selected.intel.linkedGistReference}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4 text-sm leading-7">
                  {selected.body}
                </div>

                <div className="flex flex-wrap gap-2">
                  {selected.status === "unread" ? (
                    <form action={updateContactMessageStatusV2Action}>
                      <input type="hidden" name="messageId" value={selected.id} />
                      <input type="hidden" name="status" value="read" />
                      <button className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm font-semibold">
                        Mark read
                      </button>
                    </form>
                  ) : null}
                  {selected.status !== "archived" ? (
                    <form action={updateContactMessageStatusV2Action}>
                      <input type="hidden" name="messageId" value={selected.id} />
                      <input type="hidden" name="status" value="archived" />
                      <button className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm font-semibold">
                        Archive
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </OgaV2Panel>
          ) : (
            <OgaV2Panel title="Message detail" eyebrow="Read and resolve">
              <OgaV2Empty
                title="Choose a message."
                description="Select a Contact oga message to inspect the sender identity, category, and full body."
              />
            </OgaV2Panel>
          )}
        </div>
      </div>
    </div>
  );
}
