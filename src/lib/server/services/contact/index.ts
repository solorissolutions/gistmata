import "server-only";

import type { ContactOgaMessageInput } from "@/lib/contracts/service-layer";
import type { Viewer } from "@/lib/domain/types";
import {
  createContactMessage,
  fetchContactOgaBundle,
  updateContactMessageStatus,
} from "@/lib/server/repositories/contact-repository";
import { fetchOgaDashboardSnapshot } from "@/lib/server/repositories/oga-repository";

export async function submitContactOgaMessage(
  input: ContactOgaMessageInput,
  viewer: Viewer,
) {
  return createContactMessage({
    senderUserId: viewer.id,
    accountCodeReference: input.accountCodeReference,
    category: input.category,
    body: input.body,
    intel: input.intel,
  });
}

export async function getContactOgaBundle(viewer: Viewer) {
  return fetchContactOgaBundle(viewer.id);
}

export async function getOgaInboxBundle() {
  const snapshot = await fetchOgaDashboardSnapshot();
  return snapshot.inbox;
}

export async function getOgaMessageDetail(messageId: string) {
  const inbox = await getOgaInboxBundle();
  return inbox.messages.find((message) => message.id === messageId) ?? null;
}

export async function markOgaMessageRead(messageId: string, oga: Viewer) {
  return updateContactMessageStatus({
    ogaId: oga.id,
    messageId,
    status: "read",
  });
}

export async function archiveOgaMessage(messageId: string, oga: Viewer) {
  return updateContactMessageStatus({
    ogaId: oga.id,
    messageId,
    status: "archived",
  });
}
