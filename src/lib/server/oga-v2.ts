import "server-only";

import { parseISO, startOfDay, subDays, subMinutes } from "date-fns";
import { unstable_noStore as noStore } from "next/cache";

import type { AppStore, GistRelationType } from "@/lib/domain/types";
import { readStore } from "@/lib/server/store";

export const OGA_V2_ROUTE_MAP = [
  {
    href: "/oga-v2",
    label: "Overview",
    shortLabel: "Pulse",
    description: "Platform pulse and intervention queues.",
  },
  {
    href: "/oga-v2/intel",
    label: "Intel",
    shortLabel: "Intel",
    description: "A separate operator world for collection coverage, live signals, and deep search from platform-native data.",
  },
  {
    href: "/oga-v2/mata",
    label: "Mata Monitor",
    shortLabel: "Mata",
    description: "Heat, spikes, and issue-lane movement.",
  },
  {
    href: "/oga-v2/matters",
    label: "Matas",
    shortLabel: "Matas",
    description: "Mata chains, pinning, removal, and survey triggers.",
  },
  {
    href: "/oga-v2/trust",
    label: "Trust",
    shortLabel: "Trust",
    description: "Reports, penalties, and moderation load.",
  },
  {
    href: "/oga-v2/users",
    label: "Users",
    shortLabel: "Users",
    description: "Platform oversight without turning into a profile browser.",
  },
  {
    href: "/oga-v2/judgement-day",
    label: "Judgement Day",
    shortLabel: "Survey",
    description: "Survey creation, live control, and result inspection.",
  },
  {
    href: "/oga-v2/growth",
    label: "Growth",
    shortLabel: "Growth",
    description: "Referrals, chain pressure, and invite velocity.",
  },
  {
    href: "/oga-v2/inbox",
    label: "Inbox",
    shortLabel: "Inbox",
    description: "Contact oga message queue.",
  },
  {
    href: "/oga-v2/broadcast",
    label: "Broadcast",
    shortLabel: "Voice",
    description: "Platform alerts and operational messaging.",
  },
  {
    href: "/oga-v2/location",
    label: "Location",
    shortLabel: "Location",
    description: "Geography confidence and suspicious assignments.",
  },
  {
    href: "/oga-v2/settings",
    label: "Settings",
    shortLabel: "Settings",
    description: "Flags, audit trail, and environment notes.",
  },
] as const;

function buildTopCounts(values: Array<string | null | undefined>, limit = 6) {
  return Object.entries(
    values.reduce<Record<string, number>>((accumulator, value) => {
      const key = value?.trim();

      if (!key) {
        return accumulator;
      }

      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {}),
  )
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }

      return left[0].localeCompare(right[0]);
    })
    .slice(0, limit);
}

function isSince(dateString: string, since: Date) {
  return parseISO(dateString) >= since;
}

function sum(values: number[]) {
  return values.reduce((accumulator, value) => accumulator + value, 0);
}

function getSurveyRuntimeStatus(survey: AppStore["surveys"][number], now: Date) {
  if (survey.status !== "live") {
    return survey.status;
  }

  if (parseISO(survey.endsAt) <= now) {
    return "closed" as const;
  }

  return "live" as const;
}

function getTrustProfile(store: AppStore, userId: string) {
  return store.userTrustProfiles.find((entry) => entry.userId === userId) ?? null;
}

function buildModerationState(
  user: AppStore["users"][number] | null,
  trust: AppStore["userTrustProfiles"][number] | null,
) {
  if (!user || !trust) {
    return "Unknown";
  }

  if (user.comotTagged || trust.trustScore < 58) {
    return "Comot Tag candidate";
  }

  if (trust.personalDataStrikes > 0) {
    return "Privacy watch";
  }

  if (trust.fakeLocationStrikes > 0) {
    return "Location watch";
  }

  if (trust.trustScore < 68) {
    return "Trust watch";
  }

  return "Stable";
}

function buildSelectedId<T extends { id: string }>(
  items: T[],
  preferredId?: string | null,
) {
  if (!items.length) {
    return null;
  }

  if (preferredId && items.some((item) => item.id === preferredId)) {
    return preferredId;
  }

  return items[0]?.id ?? null;
}

export async function getOgaV2DashboardSnapshot() {
  noStore();
  const store = await readStore();
  const now = new Date();
  const dayStart = startOfDay(now);
  const weekAgo = subDays(now, 7);
  const monthAgo = subDays(now, 30);
  const activeNowCutoff = subMinutes(now, 30);
  const recentMatterCutoff = subDays(now, 2);

  const users = store.users.filter((user) => !user.isOga);
  const userById = new Map(store.users.map((user) => [user.id, user]));
  const gistById = new Map(store.gists.map((gist) => [gist.id, gist]));
  const parentRelationByChildId = new Map(
    (store.gistRelations ?? []).map((relation) => [relation.childGistId, relation]),
  );
  const childRelationsByParentId = new Map<string, AppStore["gistRelations"]>();
  const trustByUserId = new Map(
    store.userTrustProfiles.map((profile) => [profile.userId, profile]),
  );
  const pinnedByGistId = new Map(
    store.pinnedGists.map((entry) => [entry.gistId, entry.priority]),
  );
  const savedByGistId = new Map<string, AppStore["savedGists"]>();
  const commentsByGistId = new Map<string, AppStore["gistComments"]>();
  const reportsByGistId = new Map<string, AppStore["gistReports"]>();
  const reactionsByGistId = new Map<string, AppStore["gistReactions"]>();
  const surveyOptionsBySurveyId = new Map<string, AppStore["surveyOptions"]>();
  const surveyVotesBySurveyId = new Map<string, AppStore["surveyVotes"]>();
  const intelByContactMessageId = new Map(
    store.intelSubmissions.map((submission) => [submission.contactMessageId, submission]),
  );

  for (const relation of store.gistRelations ?? []) {
    const current = childRelationsByParentId.get(relation.parentGistId) ?? [];
    current.push(relation);
    childRelationsByParentId.set(relation.parentGistId, current);
  }

  for (const saved of store.savedGists) {
    const current = savedByGistId.get(saved.gistId) ?? [];
    current.push(saved);
    savedByGistId.set(saved.gistId, current);
  }

  for (const comment of store.gistComments) {
    const current = commentsByGistId.get(comment.gistId) ?? [];
    current.push(comment);
    commentsByGistId.set(comment.gistId, current);
  }

  for (const report of store.gistReports) {
    const current = reportsByGistId.get(report.gistId) ?? [];
    current.push(report);
    reportsByGistId.set(report.gistId, current);
  }

  for (const reaction of store.gistReactions) {
    const current = reactionsByGistId.get(reaction.gistId) ?? [];
    current.push(reaction);
    reactionsByGistId.set(reaction.gistId, current);
  }

  for (const option of store.surveyOptions) {
    const current = surveyOptionsBySurveyId.get(option.surveyId) ?? [];
    current.push(option);
    surveyOptionsBySurveyId.set(option.surveyId, current);
  }

  for (const vote of store.surveyVotes) {
    const current = surveyVotesBySurveyId.get(vote.surveyId) ?? [];
    current.push(vote);
    surveyVotesBySurveyId.set(vote.surveyId, current);
  }

  const matterChains = store.gists
    .filter((gist) => !parentRelationByChildId.has(gist.id))
    .map((parent) => {
      const relations = (childRelationsByParentId.get(parent.id) ?? [])
        .slice()
        .sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt));
      const followUps = relations
        .map((relation) => {
          const gist = gistById.get(relation.childGistId);

          if (!gist) {
            return null;
          }

          const author = userById.get(gist.authorUserId) ?? null;
          const trust = getTrustProfile(store, gist.authorUserId);
          const commentsCount =
            commentsByGistId.get(gist.id)?.filter((entry) => entry.status === "active").length ??
            gist.commentsCount;
          const reportsCount = reportsByGistId.get(gist.id)?.length ?? gist.reportsCount;
          const savesCount = savedByGistId.get(gist.id)?.length ?? 0;

          return {
            id: gist.id,
            relationId: relation.id,
            relationType: relation.relationType,
            body: gist.body,
            tag: gist.tag,
            status: gist.status,
            createdAt: gist.createdAt,
            areaDisplay: gist.areaDisplay,
            stateName: gist.stateName,
            commentsCount,
            reportsCount,
            savesCount,
            authorUsername: author?.username ?? "unknown",
            authorTier: author?.tier ?? "New Member",
            authorTrustScore: trust?.trustScore ?? 0,
            moderationState: buildModerationState(author, trust),
            pinnedPriority: pinnedByGistId.get(gist.id) ?? null,
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

      const allGists = [
        parent,
        ...followUps
          .map((entry) => gistById.get(entry.id) ?? null)
          .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
      ];
      const gistIds = allGists.map((gist) => gist.id);
      const author = userById.get(parent.authorUserId) ?? null;
      const trust = getTrustProfile(store, parent.authorUserId);
      const allComments = gistIds.flatMap((gistId) =>
        (commentsByGistId.get(gistId) ?? []).filter((entry) => entry.status === "active"),
      );
      const allReports = gistIds.flatMap((gistId) => reportsByGistId.get(gistId) ?? []);
      const allSaves = gistIds.flatMap((gistId) => savedByGistId.get(gistId) ?? []);
      const allReactions = gistIds.flatMap((gistId) => reactionsByGistId.get(gistId) ?? []);
      const pinnedGistId = gistIds.find((gistId) => pinnedByGistId.has(gistId)) ?? null;
      const pinnedPriority = pinnedGistId ? pinnedByGistId.get(pinnedGistId) ?? null : null;
      const recentFollowUpCount = followUps.filter((entry) =>
        isSince(entry.createdAt, recentMatterCutoff),
      ).length;
      const recentCommentCount = allComments.filter((entry) =>
        isSince(entry.createdAt, recentMatterCutoff),
      ).length;
      const recentReportCount = allReports.filter((entry) =>
        isSince(entry.createdAt, recentMatterCutoff),
      ).length;
      const signalScore =
        followUps.length * 4 +
        allComments.length * 2 +
        allSaves.length * 3 +
        allReactions.length +
        allReports.length * 2;
      const recentSignal =
        recentFollowUpCount * 4 + recentCommentCount * 2 + recentReportCount * 2;
      const reportTypeCounts = buildTopCounts(allReports.map((entry) => entry.type), 3);
      const lastActivityAt =
        [
          parent.createdAt,
          ...followUps.map((entry) => entry.createdAt),
          ...allComments.map((entry) => entry.createdAt),
          ...allReports.map((entry) => entry.createdAt),
        ].sort((left, right) => +new Date(right) - +new Date(left))[0] ?? parent.createdAt;

      return {
        id: parent.id,
        body: parent.body,
        tag: parent.tag,
        status: parent.status,
        createdAt: parent.createdAt,
        lastActivityAt,
        areaDisplay: parent.areaDisplay,
        admin2Name: parent.admin2Name,
        stateName: parent.stateName,
        authorId: parent.authorUserId,
        authorUsername: author?.username ?? "unknown",
        authorTier: author?.tier ?? "New Member",
        authorTrustScore: trust?.trustScore ?? 0,
        moderationState: buildModerationState(author, trust),
        followUpCount: followUps.length,
        commentsCount: allComments.length,
        reportsCount: allReports.length,
        savesCount: allSaves.length,
        reactionsCount: allReactions.length,
        signalScore,
        recentSignal,
        recentFollowUpCount,
        recentCommentCount,
        recentReportCount,
        reportTypeCounts,
        reportTypes: allReports.map((entry) => entry.type),
        pinnedPriority,
        pinnedGistId,
        gistIds,
        followUps,
        hasPersonalDataReports: allReports.some((entry) => entry.type === "personal-data"),
        hasFakeLocationReports: allReports.some((entry) => entry.type === "fake-location"),
      };
    })
    .sort((left, right) => {
      if (right.signalScore !== left.signalScore) {
        return right.signalScore - left.signalScore;
      }

      return +new Date(right.lastActivityAt) - +new Date(left.lastActivityAt);
    });

  const queueItems = store.gistReports
    .slice()
    .sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt))
    .map((report) => {
      const gist = gistById.get(report.gistId) ?? null;
      const matterId = gist
        ? parentRelationByChildId.get(gist.id)?.parentGistId ?? gist.id
        : null;
      const matter = matterId ? matterChains.find((entry) => entry.id === matterId) ?? null : null;
      const author = gist ? userById.get(gist.authorUserId) ?? null : null;
      const trust = gist ? getTrustProfile(store, gist.authorUserId) : null;
      const reporter = userById.get(report.reporterUserId) ?? null;
      const adjudicationState =
        gist?.status === "removed"
          ? "Removed"
          : buildModerationState(author, trust) === "Comot Tag candidate"
            ? "Watchlisted"
            : "Pending";

      return {
        id: report.id,
        type: report.type,
        reasonText: report.reasonText,
        createdAt: report.createdAt,
        gistId: gist?.id ?? null,
        gistBody: gist?.body ?? "Missing gist",
        gistStatus: gist?.status ?? "removed",
        tag: gist?.tag ?? "General",
        areaDisplay: gist?.areaDisplay ?? "Unknown",
        stateName: gist?.stateName ?? "Unknown",
        matterId,
        matterBody: matter?.body ?? gist?.body ?? "Missing matter",
        authorId: author?.id ?? null,
        authorUsername: author?.username ?? "unknown",
        authorTier: author?.tier ?? "New Member",
        authorTrustScore: trust?.trustScore ?? 0,
        reporterUsername: reporter?.username ?? "unknown",
        moderationState: buildModerationState(author, trust),
        adjudicationState,
      };
    });

  const userOversight = users
    .map((user) => {
      const trust = trustByUserId.get(user.id) ?? null;
      const authoredGists = store.gists.filter((gist) => gist.authorUserId === user.id);
      const authoredParentGists = authoredGists.filter(
        (gist) => !parentRelationByChildId.has(gist.id),
      );
      const authoredFollowUps = authoredGists.filter((gist) =>
        parentRelationByChildId.has(gist.id),
      );
      const commentsAuthored = store.gistComments.filter(
        (comment) => comment.authorUserId === user.id && comment.status === "active",
      );
      const reportsAgainstUser = store.gistReports.filter((report) => {
        const gist = gistById.get(report.gistId);
        return gist?.authorUserId === user.id;
      });
      const referralsCreated = store.referralCodes.filter(
        (code) => code.createdByUserId === user.id,
      );
      const referredUsers = users.filter((entry) => entry.referredByUserId === user.id);
      const topTags = buildTopCounts(authoredGists.map((gist) => gist.tag), 3);

      return {
        id: user.id,
        username: user.username,
        tier: user.tier,
        pointsBalance: user.pointsBalance,
        state: user.homeState,
        areaDisplay: user.homeAreaDisplay,
        ageRange: user.ageRange,
        gender: user.gender,
        trustScore: trust?.trustScore ?? 0,
        trustState: buildModerationState(user, trust),
        personalDataStrikes: trust?.personalDataStrikes ?? 0,
        fakeLocationStrikes: trust?.fakeLocationStrikes ?? 0,
        comotTagged: user.comotTagged,
        referralCodeUsed: user.referralCodeUsed,
        referralChildrenCount: referredUsers.length,
        activeReferralSupply: referralsCreated.filter((entry) => entry.isActive).length,
        usedReferralSupply: referralsCreated.filter((entry) => Boolean(entry.usedByUserId)).length,
        lastActiveAt: user.lastActiveAt,
        joinedAt: user.createdAt,
        gistCount: authoredParentGists.length,
        followUpCount: authoredFollowUps.length,
        totalContributionCount: authoredGists.length + commentsAuthored.length,
        commentCount: commentsAuthored.length,
        reportsAgainstCount: reportsAgainstUser.length,
        savedCount: store.savedGists.filter((entry) => entry.userId === user.id).length,
        topTags,
      };
    })
    .sort((left, right) => +new Date(right.lastActiveAt) - +new Date(left.lastActiveAt));

  const inboxMessages = store.contactOgaMessages
    .slice()
    .sort((left, right) => {
      if (left.status !== right.status) {
        return left.status === "unread" ? -1 : 1;
      }

      return +new Date(right.createdAt) - +new Date(left.createdAt);
    })
    .map((message) => {
      const sender = message.senderUserId ? userById.get(message.senderUserId) ?? null : null;
      const intel = intelByContactMessageId.get(message.id) ?? null;

      return {
        ...message,
        senderUsername: sender?.username ?? null,
        senderTier: sender?.tier ?? null,
        senderState: sender?.homeState ?? null,
        senderArea: sender?.homeAreaDisplay ?? null,
        intel,
      };
    });

  const surveyEntries = store.surveys
    .slice()
    .sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt))
    .map((survey) => {
      const runtimeStatus = getSurveyRuntimeStatus(survey, now);
      const options = (surveyOptionsBySurveyId.get(survey.id) ?? []).map((option) => ({
        id: option.id,
        label: option.label,
        votesCount: option.votesCount,
      }));
      const totalVotes = surveyVotesBySurveyId.get(survey.id)?.length ?? 0;
      const createdBy = userById.get(survey.createdByUserId) ?? null;

      return {
        id: survey.id,
        question: survey.question,
        scopeType: survey.scopeType,
        scopeValue: survey.scopeValue,
        runtimeStatus,
        persistedStatus: survey.status,
        pinned: survey.pinned,
        startsAt: survey.startsAt,
        endsAt: survey.endsAt,
        createdAt: survey.createdAt,
        totalVotes,
        pointsReward: survey.pointsReward,
        createdByUsername: createdBy?.username ?? "oga",
        options,
      };
    });

  const liveSurveys = surveyEntries.filter((survey) => survey.runtimeStatus === "live");
  const liveSurveyIds = new Set(liveSurveys.map((survey) => survey.id));
  const pinnedMatterSlots = matterChains
    .filter((matter) => matter.pinnedPriority !== null)
    .sort((left, right) => (left.pinnedPriority ?? 99) - (right.pinnedPriority ?? 99));

  const broadcastTrail = store.ogaActions
    .filter((entry) => entry.actionType === "broadcast_sent")
    .slice()
    .sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt))
    .slice(0, 8);

  const fakeLocationByArea = buildTopCounts(
    store.gistReports
      .filter((entry) => entry.type === "fake-location")
      .map((entry) => gistById.get(entry.gistId)?.areaDisplay),
    8,
  );

  const activeLocations = buildTopCounts(store.gists.map((gist) => gist.areaDisplay), 8);
  const quietLocations = buildTopCounts(
    users
      .map((user) => user.homeAreaDisplay)
      .filter(Boolean)
      .filter((area) => !store.gists.some((gist) => gist.areaDisplay === area)),
    8,
  );

  const growthByState = buildTopCounts(users.map((user) => user.homeState), 10);
  const growthByArea = buildTopCounts(users.map((user) => user.homeAreaDisplay), 10);
  const recentReferralUses = store.referralCodes
    .filter((code) => code.usedAt)
    .slice()
    .sort(
      (left, right) =>
        +new Date(right.usedAt ?? 0) - +new Date(left.usedAt ?? 0),
    )
    .map((code) => ({
      id: code.id,
      code: code.code,
      usedAt: code.usedAt,
      expiresAt: code.expiresAt,
      state:
        code.usedByUserId && userById.get(code.usedByUserId)
          ? userById.get(code.usedByUserId)?.homeState ?? "Unknown"
          : "Unused",
      area:
        code.usedByUserId && userById.get(code.usedByUserId)
          ? userById.get(code.usedByUserId)?.homeAreaDisplay ?? null
          : null,
      active: code.isActive,
    }));

  const activeReferralChains = users.reduce<Record<string, number>>((accumulator, user) => {
    if (!user.referredByUserId) {
      return accumulator;
    }

    accumulator[user.referredByUserId] = (accumulator[user.referredByUserId] ?? 0) + 1;
    return accumulator;
  }, {});

  const areaHeatMap = buildTopCounts(
    store.gists
      .filter((gist) => gist.status === "active")
      .map((gist) => `${gist.areaDisplay}|||${gist.stateName}`),
    16,
  ).map(([composite, gistCount]) => {
    const [areaDisplay, stateName] = composite.split("|||");
    const areaGists = store.gists.filter(
      (gist) => gist.status === "active" && gist.areaDisplay === areaDisplay && gist.stateName === stateName,
    );
    const recentCount = areaGists.filter((gist) => isSince(gist.createdAt, recentMatterCutoff)).length;
    const reportCount = areaGists.reduce((accumulator, gist) => {
      return accumulator + (reportsByGistId.get(gist.id)?.length ?? 0);
    }, 0);
    const followUpCount = areaGists.reduce((accumulator, gist) => accumulator + gist.followUpCount, 0);
    const dominantTags = buildTopCounts(areaGists.map((gist) => gist.tag), 3);

    return {
      areaDisplay,
      stateName,
      gistCount,
      recentCount,
      reportCount,
      followUpCount,
      dominantTags,
      heatScore: recentCount * 4 + reportCount * 3 + followUpCount * 2 + gistCount,
    };
  });

  const trendAlerts = buildTopCounts(
    store.gists
      .filter((gist) => gist.status === "active")
      .map((gist) => `${gist.tag}|||${gist.areaDisplay}|||${gist.stateName}`),
    64,
  )
    .map(([composite]) => {
      const [tag, areaDisplay, stateName] = composite.split("|||");
      const matching = store.gists.filter(
        (gist) =>
          gist.status === "active" &&
          gist.tag === tag &&
          gist.areaDisplay === areaDisplay &&
          gist.stateName === stateName,
      );
      const recentCount = matching.filter((gist) => isSince(gist.createdAt, recentMatterCutoff)).length;
      const baselineCount = matching.filter(
        (gist) =>
          !isSince(gist.createdAt, recentMatterCutoff) && isSince(gist.createdAt, monthAgo),
      ).length;

      return {
        tag,
        areaDisplay,
        stateName,
        recentCount,
        baselineCount,
        signal: recentCount * 3 - baselineCount,
      };
    })
    .filter((entry) => entry.recentCount >= 2 && entry.signal > 0)
    .sort((left, right) => {
      if (right.signal !== left.signal) {
        return right.signal - left.signal;
      }

      return right.recentCount - left.recentCount;
    })
    .slice(0, 10)
    .map((entry) => ({
      ...entry,
      note:
        entry.baselineCount === 0
          ? "Fresh cluster with no recent baseline."
          : `Recent chatter is outrunning the prior monthly baseline (${entry.baselineCount}).`,
    }));

  const profileClusters = [
    {
      id: "local-anchors",
      label: "Local anchors",
      description: "Steady posters with trust still holding in one area.",
      members: userOversight.filter(
        (user) => user.gistCount >= 2 && user.trustScore >= 70 && !user.comotTagged,
      ),
    },
    {
      id: "amplifiers",
      label: "Amplifiers",
      description: "Accounts driving continuity through follow-ups and replies.",
      members: userOversight.filter(
        (user) => user.followUpCount + user.commentCount >= 4 && user.trustScore >= 68,
      ),
    },
    {
      id: "referral-hubs",
      label: "Referral hubs",
      description: "Users whose invite chains are already shaping network spread.",
      members: userOversight.filter((user) => user.referralChildrenCount >= 2),
    },
    {
      id: "watchlist",
      label: "Watchlist",
      description: "Accounts whose trust or report pressure needs review.",
      members: userOversight.filter(
        (user) =>
          user.trustState !== "Stable" ||
          user.reportsAgainstCount >= 2 ||
          user.personalDataStrikes > 0 ||
          user.fakeLocationStrikes > 0,
      ),
    },
  ]
    .map((cluster) => ({
      ...cluster,
      count: cluster.members.length,
      sample: cluster.members.slice(0, 6),
    }))
    .filter((cluster) => cluster.count > 0);

  const referralGraph = {
    nodes: userOversight
      .filter((user) => user.referralChildrenCount > 0)
      .slice()
      .sort((left, right) => right.referralChildrenCount - left.referralChildrenCount)
      .slice(0, 12)
      .map((user) => ({
        id: user.id,
        username: user.username,
        state: user.state,
        tier: user.tier,
        referrals: user.referralChildrenCount,
        trustState: user.trustState,
      })),
    edges: users
      .filter((user) => user.referredByUserId)
      .map((user) => ({
        fromUserId: user.referredByUserId!,
        fromUsername: userById.get(user.referredByUserId!)?.username ?? "seed",
        toUserId: user.id,
        toUsername: user.username,
        state: user.homeState,
        joinedAt: user.createdAt,
      }))
      .sort((left, right) => +new Date(right.joinedAt) - +new Date(left.joinedAt))
      .slice(0, 24),
  };

  const epicurusSources = [
    {
      id: "socint",
      label: "SOCINT",
      status: "live" as const,
      source: "Public gists, follow-up gists, comments, reactions, saves",
      extracted: [
        "conversation hotspots",
        "topic frequency",
        "continuity chains",
        "reaction pressure",
      ],
      eventsCollected:
        store.gists.length +
        store.gistRelations.length +
        store.gistComments.length +
        store.gistReactions.length +
        store.savedGists.length,
    },
    {
      id: "geoint",
      label: "GEOINT",
      status: "live" as const,
      source: "User-declared home area, gist area, location confidence, location cache",
      extracted: [
        "area/state clustering",
        "heat zones",
        "confidence gaps",
        "fake-location pressure",
      ],
      eventsCollected: store.locationCache.length + store.gists.length + users.length,
    },
    {
      id: "netint",
      label: "NETINT",
      status: "live" as const,
      source: "Referral codes, referral lineage, contribution propagation",
      extracted: [
        "invite graph",
        "referral hubs",
        "activation spread",
        "chain pressure",
      ],
      eventsCollected: store.referralCodes.length + users.filter((user) => user.referredByUserId).length,
    },
    {
      id: "humint",
      label: "HUMINT",
      status: "live" as const,
      source: "Public gists and Contact oga intel submissions",
      extracted: [
        "raw public reports",
        "issue summaries",
        "operator escalations",
        "location hints",
      ],
      eventsCollected: store.gists.length + store.intelSubmissions.length,
    },
    {
      id: "behavior",
      label: "Behavior Signals",
      status: "live" as const,
      source: "Posting cadence, follow-up ratio, reports, saves, referral usage",
      extracted: [
        "amplifier patterns",
        "watchlist signals",
        "trend participation",
        "contribution clusters",
      ],
      eventsCollected:
        store.gists.length + store.gistComments.length + store.gistReports.length + store.savedGists.length,
    },
    {
      id: "survey",
      label: "Judgement Day Signals",
      status: "live" as const,
      source: "Survey scope, votes, participation spread",
      extracted: [
        "pulse adoption",
        "participation concentration",
        "topic urgency",
      ],
      eventsCollected: store.surveys.length + store.surveyVotes.length,
    },
    {
      id: "safety-exclusions",
      label: "Excluded by design",
      status: "blocked" as const,
      source: "Device surveillance, credentials, messages outside the app, hidden tracking",
      extracted: [
        "not collected",
      ],
      eventsCollected: 0,
    },
  ];

  const chrome = {
    inboxUnread: inboxMessages.filter((message) => message.status === "unread").length,
    trustQueue: queueItems.length,
    liveSurveys: liveSurveys.length,
    pinnedMatters: pinnedMatterSlots.length,
    preIntelAlerts: trendAlerts.length,
    collectionAlerts: users.filter((user) => !user.homeAreaDisplay).length,
  };

  return {
    routeMap: OGA_V2_ROUTE_MAP,
    chrome,
    overview: {
      generatedAt: now.toISOString(),
      metrics: {
        activeUsersNow: users.filter((user) => isSince(user.lastActiveAt, activeNowCutoff)).length,
        dailyActiveUsers: users.filter((user) => isSince(user.lastActiveAt, dayStart)).length,
        weeklyActiveUsers: users.filter((user) => isSince(user.lastActiveAt, weekAgo)).length,
        newUsersToday: users.filter((user) => isSince(user.createdAt, dayStart)).length,
        retainedUsers: users.filter(
          (user) => parseISO(user.createdAt) < weekAgo && isSince(user.lastActiveAt, weekAgo),
        ).length,
        totalGistsToday: store.gists.filter((gist) => isSince(gist.createdAt, dayStart)).length,
        followUpGistsToday: store.gistRelations.filter((relation) =>
          isSince(relation.createdAt, dayStart),
        ).length,
        commentsToday: store.gistComments.filter(
          (comment) => comment.status === "active" && isSince(comment.createdAt, dayStart),
        ).length,
        savesToday: store.savedGists.filter((entry) => isSince(entry.createdAt, dayStart)).length,
        reportsToday: store.gistReports.filter((entry) => isSince(entry.createdAt, dayStart)).length,
        liveSurveyParticipation: sum(liveSurveys.map((survey) => survey.totalVotes)),
      },
      topTags: buildTopCounts(store.gists.map((gist) => gist.tag), 8),
      topAreas: buildTopCounts(store.gists.map((gist) => gist.areaDisplay), 8),
      topStates: buildTopCounts(store.gists.map((gist) => gist.stateName), 8),
      ageMix: buildTopCounts(users.map((user) => user.ageRange), 8),
      genderMix: buildTopCounts(users.map((user) => user.gender), 8),
      referralUsage: {
        totalCodes: store.referralCodes.length,
        usedCodes: store.referralCodes.filter((code) => Boolean(code.usedByUserId)).length,
        activeCodes: store.referralCodes.filter((code) => code.isActive).length,
      },
      reportBacklog: {
        total: queueItems.length,
        personalData: queueItems.filter((entry) => entry.type === "personal-data").length,
        fakeLocation: queueItems.filter((entry) => entry.type === "fake-location").length,
        general: queueItems.filter((entry) => entry.type === "general").length,
      },
      trustRiskSpikes: {
        riskUsers: userOversight.filter((user) => user.trustScore < 68 || user.comotTagged).length,
        personalDataToday: store.gistReports.filter(
          (entry) => entry.type === "personal-data" && isSince(entry.createdAt, dayStart),
        ).length,
        fakeLocationToday: store.gistReports.filter(
          (entry) => entry.type === "fake-location" && isSince(entry.createdAt, dayStart),
        ).length,
      },
      liveSurveys: liveSurveys.slice(0, 3),
      pinnedMatters: pinnedMatterSlots.slice(0, 3),
      inboxUnread: chrome.inboxUnread,
      locationHealth: {
        knownUsers: users.filter((user) => Boolean(user.homeAreaDisplay)).length,
        unknownUsers: users.filter((user) => !user.homeAreaDisplay).length,
        lowConfidenceUsers: users.filter(
          (user) => user.locationConfidence !== null && user.locationConfidence < 0.8,
        ).length,
        cachedLocations: store.locationCache.length,
      },
    },
    mata: {
      hottestMatters: matterChains.slice(0, 8),
      risingMatters: matterChains
        .filter((matter) => matter.recentSignal > 0)
        .slice()
        .sort((left, right) => right.recentSignal - left.recentSignal)
        .slice(0, 8),
      quietAreas: quietLocations,
      localSpikes: buildTopCounts(
        store.gists
          .filter((gist) => isSince(gist.createdAt, recentMatterCutoff))
          .map((gist) => `${gist.areaDisplay} / ${gist.tag}`),
        8,
      ),
      surgingIssueLanes: buildTopCounts(
        store.gists.filter((gist) => isSince(gist.createdAt, weekAgo)).map((gist) => gist.tag),
        8,
      ),
      issueLaneCounts: ["NEPA", "Fuel", "Govt", "Safety", "Market", "Japa"].map((tag) => ({
        tag,
        count: store.gists.filter((gist) => gist.tag === tag).length,
      })),
      mostFollowed: matterChains
        .slice()
        .sort((left, right) => right.followUpCount - left.followUpCount)
        .slice(0, 6),
      mostSaved: matterChains
        .slice()
        .sort((left, right) => right.savesCount - left.savesCount)
        .slice(0, 6),
      fastFollowUpGrowth: matterChains
        .slice()
        .sort((left, right) => right.recentFollowUpCount - left.recentFollowUpCount)
        .filter((matter) => matter.recentFollowUpCount > 0)
        .slice(0, 6),
      activeLocations,
    },
    matters: {
      items: matterChains,
      selectedMatterId: (preferredId?: string | null) =>
        buildSelectedId(matterChains, preferredId),
      tagOptions: buildTopCounts(matterChains.map((matter) => matter.tag), 12).map(([value]) => value),
      stateOptions: buildTopCounts(matterChains.map((matter) => matter.stateName), 12).map(
        ([value]) => value,
      ),
      statusOptions: [
        "all",
        "active",
        "removed",
        "reported",
        "pinned",
        "follow-up-heavy",
      ] as const,
    },
    trust: {
      summary: {
        total: queueItems.length,
        unresolved: queueItems.filter((entry) => entry.adjudicationState === "Pending").length,
        personalData: queueItems.filter((entry) => entry.type === "personal-data").length,
        fakeLocation: queueItems.filter((entry) => entry.type === "fake-location").length,
        general: queueItems.filter((entry) => entry.type === "general").length,
        comotCandidates: userOversight.filter(
          (user) => user.trustState === "Comot Tag candidate",
        ).length,
      },
      queue: queueItems,
      selectedQueueItemId: (preferredId?: string | null) =>
        buildSelectedId(queueItems, preferredId),
      riskUsers: userOversight
        .filter(
          (user) =>
            user.trustScore < 70 ||
            user.personalDataStrikes > 0 ||
            user.fakeLocationStrikes > 0 ||
            user.comotTagged,
        )
        .slice()
        .sort((left, right) => left.trustScore - right.trustScore)
        .slice(0, 12),
      areaTrends: buildTopCounts(queueItems.map((entry) => entry.areaDisplay), 8),
      tagTrends: buildTopCounts(queueItems.map((entry) => entry.tag), 8),
      actionHistory: store.ogaActions
        .filter((entry) => entry.actionType.startsWith("gist_"))
        .slice()
        .sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt))
        .slice(0, 12),
    },
    users: {
      items: userOversight,
      selectedUserId: (preferredId?: string | null) =>
        buildSelectedId(userOversight, preferredId),
      states: buildTopCounts(userOversight.map((user) => user.state), 12).map(([value]) => value),
      trustStates: buildTopCounts(userOversight.map((user) => user.trustState), 8).map(
        ([value]) => value,
      ),
      tierMix: buildTopCounts(userOversight.map((user) => user.tier), 8),
    },
    judgementDay: {
      summary: {
        total: surveyEntries.length,
        live: liveSurveys.length,
        pinned: surveyEntries.filter((survey) => survey.pinned).length,
        closed: surveyEntries.filter((survey) => survey.runtimeStatus === "closed").length,
        totalVotes: sum(surveyEntries.map((survey) => survey.totalVotes)),
      },
      supportMatrix: [
        {
          type: "single-choice",
          readiness: "Live runtime",
          note: "Publishes to the public Judgement Day flow right now.",
        },
        {
          type: "multi-choice",
          readiness: "Staged",
          note: "Operator surface prepared here, public runtime still pending.",
        },
        {
          type: "multi-question",
          readiness: "Staged",
          note: "Need public response storage before publication is safe.",
        },
        {
          type: "anonymous-feedback",
          readiness: "Staged",
          note: "Need public text-feedback intake and moderation review wiring.",
        },
      ],
      surveys: surveyEntries,
      liveSurveys,
    },
    growth: {
      summary: {
        totalCodes: store.referralCodes.length,
        activeCodes: store.referralCodes.filter((code) => code.isActive).length,
        usedCodes: store.referralCodes.filter((code) => Boolean(code.usedByUserId)).length,
        activatedUsers: users.length,
        inviteVelocity7d: store.referralCodes.filter(
          (code) => code.usedAt && isSince(code.usedAt, weekAgo),
        ).length,
        inviteVelocity30d: store.referralCodes.filter(
          (code) => code.usedAt && isSince(code.usedAt, monthAgo),
        ).length,
      },
      byState: growthByState,
      byArea: growthByArea,
      recentUses: recentReferralUses.slice(0, 12),
      chainPressure: Object.entries(activeReferralChains)
        .map(([userId, count]) => ({
          userId,
          username: userById.get(userId)?.username ?? "seed",
          count,
        }))
        .sort((left, right) => right.count - left.count)
        .slice(0, 8),
      supplyPatterns: {
        exhausted: store.referralCodes.filter(
          (code) => !code.isActive && Boolean(code.usedByUserId),
        ).length,
        unusedActive: store.referralCodes.filter(
          (code) => code.isActive && !code.usedByUserId,
        ).length,
        dormant: store.referralCodes.filter(
          (code) =>
            code.isActive &&
            !code.usedByUserId &&
            code.expiresAt &&
            parseISO(code.expiresAt) < subDays(now, -7),
        ).length,
      },
    },
    epicurus: {
      summary: {
        liveSources: epicurusSources.filter((source) => source.status === "live").length,
        blockedSources: epicurusSources.filter((source) => source.status === "blocked").length,
        rawEvents:
          store.gists.length +
          store.gistComments.length +
          store.gistReactions.length +
          store.gistRelations.length +
          store.surveyVotes.length +
          store.referralCodes.length +
          store.contactOgaMessages.length +
          store.intelSubmissions.length,
        anomalySignals:
          trendAlerts.length +
          queueItems.length +
          (profileClusters.find((cluster) => cluster.id === "watchlist")?.count ?? 0),
      },
      collectionSources: epicurusSources,
      ingestHealth: {
        missingLocations: users.filter((user) => !user.homeAreaDisplay).length,
        lowConfidenceLocations: users.filter(
          (user) => user.locationConfidence !== null && user.locationConfidence < 0.8,
        ).length,
        pendingInboxIntel: store.intelSubmissions.filter((submission) => submission.status === "new").length,
        fakeLocationReports: store.gistReports.filter((entry) => entry.type === "fake-location").length,
      },
      pipelineStages: [
        {
          stage: "Collection",
          note: "Platform-native events and public content only.",
        },
        {
          stage: "Normalization",
          note: "Store-backed records aligned through the service/repository path.",
        },
        {
          stage: "Enrichment",
          note: "Topic, trend, referral, trust, and location-derived summaries.",
        },
        {
          stage: "Delivery",
          note: "Overview, Pre-Intel, Trust, Growth, and Inbox operator surfaces.",
        },
      ],
    },
    preIntel: {
      summary: {
        heatZones: areaHeatMap.length,
        watchlistUsers: profileClusters.find((cluster) => cluster.id === "watchlist")?.count ?? 0,
        trendAlerts: trendAlerts.length,
        referralHubs: referralGraph.nodes.length,
      },
      heatMap: areaHeatMap,
      referralGraph,
      trendAlerts,
      profileClusters,
      searchable: {
        matters: matterChains.map((matter) => ({
          id: matter.id,
          type: "matter" as const,
          label: matter.body,
          tag: matter.tag,
          areaDisplay: matter.areaDisplay,
          stateName: matter.stateName,
          owner: matter.authorUsername,
          signalScore: matter.signalScore,
        })),
        users: userOversight.map((user) => ({
          id: user.id,
          type: "user" as const,
          label: `@${user.username}`,
          state: user.state,
          areaDisplay: user.areaDisplay,
          trustState: user.trustState,
          referralChildrenCount: user.referralChildrenCount,
          totalContributionCount: user.totalContributionCount,
        })),
      },
    },
    inbox: {
      unreadCount: chrome.inboxUnread,
      readCount: inboxMessages.filter((message) => message.status === "read").length,
      archivedCount: inboxMessages.filter((message) => message.status === "archived").length,
      todayCount: inboxMessages.filter((message) => isSince(message.createdAt, dayStart)).length,
      messages: inboxMessages,
      selectedMessageId: (preferredId?: string | null) =>
        buildSelectedId(inboxMessages, preferredId),
    },
    broadcast: {
      audienceEstimates: {
        all: users.length,
        inactive: users.filter((user) => parseISO(user.lastActiveAt) < weekAgo).length,
        stateLeaders: growthByState.slice(0, 5),
      },
      liveSurveys: liveSurveys.slice(0, 3),
      recentAlerts: store.alerts
        .slice()
        .sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt))
        .slice(0, 16),
      broadcastTrail,
    },
    location: {
      resolutionHealth: {
        knownUsers: users.filter((user) => Boolean(user.homeAreaDisplay)).length,
        unknownUsers: users.filter((user) => !user.homeAreaDisplay).length,
        lowConfidenceUsers: users.filter(
          (user) => user.locationConfidence !== null && user.locationConfidence < 0.8,
        ).length,
        cachedLocations: store.locationCache.length,
      },
      mostActivePlaces: activeLocations,
      quietPlaces: quietLocations,
      suspiciousAreas: fakeLocationByArea,
      unknownUsers: users
        .filter((user) => !user.homeAreaDisplay)
        .slice(0, 12)
        .map((user) => ({
          id: user.id,
          username: user.username,
          state: user.homeState,
          lastActiveAt: user.lastActiveAt,
        })),
      lowConfidenceUsers: users
        .filter((user) => user.locationConfidence !== null && user.locationConfidence < 0.8)
        .slice()
        .sort((left, right) => (left.locationConfidence ?? 0) - (right.locationConfidence ?? 0))
        .slice(0, 12)
        .map((user) => ({
          id: user.id,
          username: user.username,
          areaDisplay: user.homeAreaDisplay,
          state: user.homeState,
          confidence: user.locationConfidence ?? 0,
          lastActiveAt: user.lastActiveAt,
        })),
      providerMix: buildTopCounts(store.locationCache.map((location) => location.provider), 8),
    },
    settings: {
      flags: store.featureFlags,
      auditTrail: store.ogaActions
        .slice()
        .sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt))
        .slice(0, 20),
      operatorNotes: [
        "Old /oga stays preserved while /oga-v2 is inspected.",
        "Local/dev access to /oga-v2 is intentionally open by default.",
        "Public Judgement Day publishing is currently safe for single-choice polls only.",
      ],
      environmentNotes: [
        {
          label: "Runtime",
          value: process.env.NODE_ENV ?? "development",
        },
        {
          label: "Oga v2 local open",
          value:
            process.env.NODE_ENV !== "production" || process.env.ALLOW_OGA_V2_OPEN === "true"
              ? "enabled"
              : "gated",
        },
        {
          label: "Legacy oga demo open",
          value: process.env.ALLOW_OGA_DEMO_ACCESS === "true" ? "enabled" : "disabled",
        },
        {
          label: "Live survey runtime",
          value: `${liveSurveyIds.size} active`,
        },
      ],
    },
  };
}

export type OgaV2DashboardSnapshot = Awaited<
  ReturnType<typeof getOgaV2DashboardSnapshot>
>;

export function relationLabel(value: GistRelationType) {
  switch (value) {
    case "follow-up":
      return "Follow-up";
    case "update":
      return "Update";
    case "confirm":
      return "Confirm";
    case "counter":
      return "Counter";
    case "same-for-my-side":
      return "Same for my side";
    default:
      return value;
  }
}
