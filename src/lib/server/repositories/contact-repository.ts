import "server-only";

import type { ContactOgaCategory, IntelMethod, IntelUrgency } from "@/lib/domain/types";
import {
  createContactOgaMessage,
  getContactOgaBundle,
  getOgaInboxBundle,
  setContactOgaMessageStatus,
} from "@/lib/server/store";

export async function fetchContactOgaBundle(viewerId: string) {
  return getContactOgaBundle(viewerId);
}

export async function createContactMessage(input: {
  senderUserId: string;
  accountCodeReference?: string;
  category?: ContactOgaCategory;
  body: string;
  intel?: {
    method: IntelMethod;
    urgency: IntelUrgency;
    summary: string;
    locationHint?: string;
    linkedGistReference?: string;
  };
}) {
  return createContactOgaMessage(input);
}

export async function fetchLegacyOgaInboxBundle(selectedMessageId?: string | null) {
  return getOgaInboxBundle(selectedMessageId);
}

export async function updateContactMessageStatus(input: {
  ogaId: string;
  messageId: string;
  status: "read" | "archived";
}) {
  return setContactOgaMessageStatus(input);
}
