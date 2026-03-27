import "server-only";

import { reportGist, setGistStatus } from "@/lib/server/store";

export async function createReport(input: {
  viewerId: string;
  gistId: string;
  type: "general" | "personal-data" | "fake-location";
  reasonText?: string;
}) {
  return reportGist(input);
}

export async function updateGistStatus(input: {
  ogaId: string;
  gistId: string;
  status: "active" | "removed";
}) {
  return setGistStatus(input);
}
