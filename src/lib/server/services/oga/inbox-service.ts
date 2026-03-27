import "server-only";

import type { Viewer } from "@/lib/domain/types";
import { fetchOgaDashboardSnapshot } from "@/lib/server/repositories/oga-repository";
import { updateContactMessageStatus } from "@/lib/server/repositories/contact-repository";

export async function getOgaInboxBundle(filters?: { status?: string; messageId?: string }) {
  const snapshot = await fetchOgaDashboardSnapshot();
  const status = filters?.status ?? "all";
  const filtered = snapshot.inbox.messages.filter(
    (message) => status === "all" || message.status === status,
  );
  const selectedMessageId =
    filtered.find((message) => message.id === filters?.messageId)?.id ?? filtered[0]?.id ?? null;
  const selectedMessage = filtered.find((message) => message.id === selectedMessageId) ?? null;

  return {
    summary: {
      unreadCount: snapshot.inbox.unreadCount,
      readCount: snapshot.inbox.readCount,
      archivedCount: snapshot.inbox.archivedCount,
      todayCount: snapshot.inbox.todayCount,
    },
    filters: {
      status,
    },
    messages: filtered,
    selectedMessageId,
    selectedMessage,
  };
}

export async function getOgaMessageDetail(id: string) {
  const snapshot = await fetchOgaDashboardSnapshot();
  return snapshot.inbox.messages.find((message) => message.id === id) ?? null;
}

export async function markMessageRead(id: string, oga: Viewer) {
  return updateContactMessageStatus({
    ogaId: oga.id,
    messageId: id,
    status: "read",
  });
}

export async function archiveMessage(id: string, oga: Viewer) {
  return updateContactMessageStatus({
    ogaId: oga.id,
    messageId: id,
    status: "archived",
  });
}
