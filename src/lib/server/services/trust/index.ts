import "server-only";

import type { Viewer } from "@/lib/domain/types";
import { reportSchema } from "@/lib/domain/validation";
import {
  createReport,
  updateGistStatus,
} from "@/lib/server/repositories/trust-repository";

export function runDraftSafetyChecks() {
  return {
    personalDataRisk: false,
    fakeLocationRisk: false,
    allowed: true,
  };
}

export async function submitReport(input: {
  gistId: string;
  type: "general" | "personal-data" | "fake-location";
  reasonText?: string;
}, viewer: Viewer) {
  const validated = reportSchema.parse(input);

  return createReport({
    viewerId: viewer.id,
    gistId: validated.gistId,
    type: validated.type,
    reasonText: validated.reasonText,
  });
}

export async function removeGist(gistId: string, oga: Viewer) {
  return updateGistStatus({
    ogaId: oga.id,
    gistId,
    status: "removed",
  });
}

export async function restoreGist(gistId: string, oga: Viewer) {
  return updateGistStatus({
    ogaId: oga.id,
    gistId,
    status: "active",
  });
}
