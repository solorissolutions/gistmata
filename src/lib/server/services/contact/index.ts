import "server-only";

import type { ContactOgaMessageInput } from "@/lib/contracts/service-layer";
import type { Viewer } from "@/lib/domain/types";
import {
  createContactMessage,
  fetchContactOgaBundle,
  updateContactMessageStatus,
} from "@/lib/server/repositories/contact-repository";

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
