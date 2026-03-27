import "server-only";

import type { Viewer } from "@/lib/domain/types";
import { pinGistRecord, unpinGistRecord, fetchOgaDashboardSnapshot } from "@/lib/server/repositories/oga-repository";
import { updateGistStatus } from "@/lib/server/repositories/trust-repository";

type MatterItem = Awaited<ReturnType<typeof fetchOgaDashboardSnapshot>>["matters"]["items"][number];

function matchesStatus(status: string, matter: MatterItem) {
  if (status === "all") return true;
  if (status === "active") return matter.status === "active";
  if (status === "removed") return matter.status === "removed";
  if (status === "reported") return matter.reportsCount > 0;
  if (status === "pinned") return matter.pinnedPriority !== null;
  if (status === "follow-up-heavy") return matter.followUpCount > 0;
  return true;
}

export async function getOgaMattersBundle(filters: {
  q?: string;
  tag?: string;
  state?: string;
  status?: string;
  matterId?: string;
}) {
  const snapshot = await fetchOgaDashboardSnapshot();
  const q = filters.q?.trim().toLowerCase() ?? "";
  const tag = filters.tag ?? "all";
  const state = filters.state ?? "all";
  const status = filters.status ?? "all";

  const filtered = snapshot.matters.items.filter((matter) => {
    const matchesQuery =
      q.length === 0 ||
      [
        matter.body,
        matter.authorUsername,
        matter.tag,
        matter.areaDisplay,
        matter.stateName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);

    return (
      matchesQuery &&
      (tag === "all" || matter.tag === tag) &&
      (state === "all" || matter.stateName === state) &&
      matchesStatus(status, matter)
    );
  });

  const selectedMatterId =
    filtered.find((matter) => matter.id === filters.matterId)?.id ?? filtered[0]?.id ?? null;
  const selectedMatter = filtered.find((matter) => matter.id === selectedMatterId) ?? null;

  return {
    summary: {
      total: snapshot.matters.items.length,
      filtered: filtered.length,
      pinned: snapshot.matters.items.filter((matter) => matter.pinnedPriority !== null).length,
      reported: snapshot.matters.items.filter((matter) => matter.reportsCount > 0).length,
      chains: snapshot.matters.items.filter((matter) => matter.followUpCount > 0).length,
    },
    filters: {
      q: filters.q ?? "",
      tag,
      state,
      status,
    },
    options: {
      tags: snapshot.matters.tagOptions,
      states: snapshot.matters.stateOptions,
      statuses: snapshot.matters.statusOptions,
    },
    items: filtered,
    selectedMatterId,
    selectedMatter,
  };
}

export async function getMatterDetailBundle(id: string) {
  const snapshot = await fetchOgaDashboardSnapshot();
  return snapshot.matters.items.find((matter) => matter.id === id) ?? null;
}

export async function pinGist(id: string, priority: 1 | 2 | 3, oga: Viewer) {
  return pinGistRecord({
    ogaId: oga.id,
    gistId: id,
    priority,
  });
}

export async function unpinGist(id: string, oga: Viewer) {
  return unpinGistRecord({
    ogaId: oga.id,
    gistId: id,
  });
}

export async function reorderPinnedGists(id: string, priority: 1 | 2 | 3, oga: Viewer) {
  return pinGist(id, priority, oga);
}

export async function removeGist(id: string, oga: Viewer, _reason?: string) {
  void _reason;

  return updateGistStatus({
    ogaId: oga.id,
    gistId: id,
    status: "removed",
  });
}

export async function restoreGist(id: string, oga: Viewer) {
  return updateGistStatus({
    ogaId: oga.id,
    gistId: id,
    status: "active",
  });
}

export async function getCreateSurveyFromMatterHelper(id: string) {
  const matter = await getMatterDetailBundle(id);

  if (!matter) {
    return null;
  }

  return {
    sourceMatter: matter,
    prefilledQuestion: `Judgement Day: ${matter.body}`.slice(0, 140),
  };
}
