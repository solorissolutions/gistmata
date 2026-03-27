import "server-only";

import { fetchOgaDashboardSnapshot } from "@/lib/server/repositories/oga-repository";

export async function getOgaUsersBundle(filters: {
  q?: string;
  state?: string;
  trust?: string;
  userId?: string;
}) {
  const snapshot = await fetchOgaDashboardSnapshot();
  const q = filters.q?.trim().toLowerCase() ?? "";
  const state = filters.state ?? "all";
  const trust = filters.trust ?? "all";
  const generatedAtMs = new Date(snapshot.overview.generatedAt).getTime();

  const filtered = snapshot.users.items.filter((user) => {
    const matchesQuery =
      q.length === 0 ||
      [user.username, user.state, user.areaDisplay ?? "", user.tier]
        .join(" ")
        .toLowerCase()
        .includes(q);

    return (
      matchesQuery &&
      (state === "all" || user.state === state) &&
      (trust === "all" || user.trustState === trust)
    );
  });

  const selectedUserId =
    filtered.find((user) => user.id === filters.userId)?.id ?? filtered[0]?.id ?? null;
  const selectedUser = filtered.find((user) => user.id === selectedUserId) ?? null;

  return {
    summary: {
      total: snapshot.users.items.length,
      filtered: filtered.length,
      trustWatch: snapshot.users.items.filter((user) => user.trustState !== "Stable").length,
      comotTagged: snapshot.users.items.filter((user) => user.comotTagged).length,
      recentActives: snapshot.users.items.filter(
        (user) => generatedAtMs - new Date(user.lastActiveAt).getTime() < 1000 * 60 * 60 * 24,
      ).length,
    },
    filters: {
      q: filters.q ?? "",
      state,
      trust,
    },
    options: {
      states: snapshot.users.states,
      trustStates: snapshot.users.trustStates,
    },
    items: filtered,
    selectedUserId,
    selectedUser,
  };
}

export async function getUserDetailOpsBundle(userId: string) {
  const snapshot = await fetchOgaDashboardSnapshot();
  return snapshot.users.items.find((user) => user.id === userId) ?? null;
}

export async function getGrowthSummaryBundle() {
  const snapshot = await fetchOgaDashboardSnapshot();
  return snapshot.growth;
}

export async function getReferralSummaryBundle() {
  const snapshot = await fetchOgaDashboardSnapshot();
  return {
    summary: snapshot.growth.summary,
    supplyPatterns: snapshot.growth.supplyPatterns,
    recentUses: snapshot.growth.recentUses,
    chainPressure: snapshot.growth.chainPressure,
  };
}
