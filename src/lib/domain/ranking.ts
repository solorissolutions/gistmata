import { differenceInHours, differenceInMinutes, parseISO } from "date-fns";

import { TIER_DEFINITIONS } from "@/lib/domain/constants";
import type {
  AlertGroupView,
  AlertRecord,
  FeedLevel,
  GistRecord,
  GistReactionRecord,
  UserPointsLedgerRecord,
  UserTier,
} from "@/lib/domain/types";

export function getTierProgress(points: number) {
  const current =
    [...TIER_DEFINITIONS]
      .reverse()
      .find((definition) => points >= definition.minPoints) ??
    TIER_DEFINITIONS[0];
  const next = TIER_DEFINITIONS.find(
    (definition) => definition.minPoints > current.minPoints,
  );

  if (!next) {
    return {
      current,
      next: null,
      progress: 1,
      pointsToNext: 0,
    };
  }

  const range = next.minPoints - current.minPoints;
  const progress = Math.min(1, Math.max(0, (points - current.minPoints) / range));

  return {
    current,
    next,
    progress,
    pointsToNext: Math.max(0, next.minPoints - points),
  };
}

export function computeFeedScore(params: {
  gist: GistRecord;
  reactionsCount: number;
  commentsCount: number;
  reportsCount: number;
  trustScore: number;
  level: FeedLevel;
}) {
  const now = new Date();
  const createdAt = parseISO(params.gist.createdAt);
  const hoursOld = Math.max(1, differenceInHours(now, createdAt));
  const minutesOld = Math.max(1, differenceInMinutes(now, createdAt));

  if (params.level === "hot") {
    return (
      (params.reactionsCount * 2.3 + params.commentsCount * 3.2) /
        Math.pow(hoursOld + 1, 1.18) +
      params.trustScore / 20 -
      params.reportsCount * 2.4
    );
  }

  return (
    2000 / (minutesOld + 30) +
    params.reactionsCount * 0.6 +
    params.commentsCount * 0.95 +
    params.trustScore / 30 -
    params.reportsCount * 1.8
  );
}

export function aggregateReactions(
  reactions: GistReactionRecord[],
): Record<"wahala" | "omo" | "sharp", number> {
  return reactions.reduce(
    (accumulator, reaction) => {
      accumulator[reaction.type] += 1;
      return accumulator;
    },
    { wahala: 0, omo: 0, sharp: 0 },
  );
}

export function buildLeaderboardFromLedger(params: {
  users: Array<{
    id: string;
    username: string;
    tier: UserTier;
    homeState: string;
    pointsBalance: number;
  }>;
  ledger: UserPointsLedgerRecord[];
  mode: "monthly" | "all-time";
}) {
  const threshold =
    params.mode === "monthly"
      ? new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
      : null;

  const pointsByUser = new Map<string, number>();

  if (params.mode === "all-time") {
    for (const user of params.users) {
      pointsByUser.set(user.id, user.pointsBalance);
    }
  } else {
    for (const entry of params.ledger) {
      if (threshold && parseISO(entry.createdAt) < threshold) {
        continue;
      }
      pointsByUser.set(
        entry.userId,
        (pointsByUser.get(entry.userId) ?? 0) + entry.pointsDelta,
      );
    }
  }

  return params.users
    .map((user) => ({
      userId: user.id,
      username: user.username,
      tier: user.tier,
      state: user.homeState,
      points: pointsByUser.get(user.id) ?? 0,
    }))
    .sort((left, right) => right.points - left.points)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}

export function groupAlerts(alerts: AlertRecord[]): AlertGroupView[] {
  const groups = new Map<string, AlertRecord[]>();

  for (const alert of alerts) {
    const title =
      alert.type === "comment"
        ? "Comments"
        : alert.type === "activity"
          ? "Mata activity"
          : alert.type === "points"
              ? "Points"
              : "Account / inactivity";

    const current = groups.get(title) ?? [];
    current.push(alert);
    groups.set(title, current);
  }

  return [...groups.entries()].map(([title, groupedAlerts]) => ({
    title: title as AlertGroupView["title"],
    alerts: groupedAlerts,
  }));
}
