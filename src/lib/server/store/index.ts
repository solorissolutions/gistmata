import { parseISO, startOfDay, subDays } from "date-fns";

import {
  getNextTier,
  getTierByPoints,
  MAX_COMMENTS_PER_GIST_PER_USER,
  MAX_GISTS_PER_DAY,
  REACTION_OPTIONS,
} from "@/lib/domain/constants";
import { detectPersonalData } from "@/lib/domain/moderation";
import {
  aggregateReactions,
  buildLeaderboardFromLedger,
  computeFeedScore,
  getTierProgress,
  groupAlerts,
} from "@/lib/domain/ranking";
import type {
  AppStore,
  GistCardView,
  LeaderboardEntry,
  LocationSnapshot,
  PredictionModuleView,
  SurveyView,
  UserRecord,
  Viewer,
} from "@/lib/domain/types";
import { normalizeUsername } from "@/lib/utils";
import {
  isPostgresStoreConfigured,
  loadPostgresStore,
  mutatePostgresStore,
  replacePostgresStore,
} from "@/lib/server/store/postgres-store";
import { buildSeedStore } from "@/lib/server/store/seed-data";
import {
  createAccountCode,
  createReferralCode,
  daysFromNow,
  hashSecretValue,
  hashValue,
  makeId,
  randomToken,
  verifySecretValue,
} from "@/lib/server/store/helpers";

const DEFAULT_REFERRAL_ALLOWANCE = 5;

const OGA_USERNAME = "oga";
const OGA_USERNAME_NORMALIZED = "oga";
const OGA_ACCOUNT_CODE = "GM-0001-OG";
const OGA_DEFAULT_PIN = "091332";

let writeChain = Promise.resolve();

async function getLegacyStorePersistence() {
  return import("@/lib/server/store/legacy-file-store");
}

export async function ensureOgaAccount() {
  return mutateStore((store) => {
    const ogaByUsername = store.users.filter(
      (user) => user.usernameNormalized === OGA_USERNAME_NORMALIZED,
    );

    if (ogaByUsername.length > 1) {
      const [, ...duplicates] = ogaByUsername;

      for (const dup of duplicates) {
        const suffix = dup.id.slice(-6);
        dup.username = `${OGA_USERNAME}_dup_${suffix}`;
        dup.usernameNormalized = dup.username.toLowerCase();
        dup.isOga = false;
      }
    }

    const candidate =
      ogaByUsername[0] ??
      store.users.find((user) => verifySecretValue(OGA_ACCOUNT_CODE, user.accountCodeHash)) ??
      store.users.find((user) => user.isOga) ??
      null;

    const now = new Date().toISOString();

    if (!candidate) {
      const user: UserRecord = {
        id: makeId("usr"),
        username: OGA_USERNAME,
        usernameNormalized: OGA_USERNAME_NORMALIZED,
        pinHash: hashSecretValue(OGA_DEFAULT_PIN),
        accountCodeHash: hashSecretValue(OGA_ACCOUNT_CODE),
        homeState: "FCT",
        ageRange: "35-44",
        gender: "Prefer not to say",
        tier: getTierByPoints(999),
        pointsBalance: 999,
        isOga: true,
        comotTagged: false,
        createdAt: now,
        lastActiveAt: now,
        homeAreaDisplay: null,
        homeAreaBucket: null,
        homeAdmin2Name: null,
        homeAdmin2Type: null,
        locationConfidence: null,
        referredByUserId: null,
        referralCodeUsed: null,
        devRecoveryCode: OGA_ACCOUNT_CODE,
      };

      store.users.unshift(user);
      return user;
    }

    candidate.username = OGA_USERNAME;
    candidate.usernameNormalized = OGA_USERNAME_NORMALIZED;
    candidate.isOga = true;
    candidate.pinHash = hashSecretValue(OGA_DEFAULT_PIN);
    candidate.accountCodeHash = hashSecretValue(OGA_ACCOUNT_CODE);
    candidate.devRecoveryCode = OGA_ACCOUNT_CODE;

    if (!candidate.homeState) {
      candidate.homeState = "FCT";
    }

    if (!candidate.createdAt) {
      candidate.createdAt = now;
    }

    if (!candidate.lastActiveAt) {
      candidate.lastActiveAt = now;
    }

    if (candidate.comotTagged) {
      candidate.comotTagged = false;
    }

    // Enforce single oga flag.
    for (const user of store.users) {
      if (user.id !== candidate.id && user.isOga) {
        user.isOga = false;
      }
    }

    return candidate;
  });
}

function coerceArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/**
 * Ensure every collection field the app depends on is present as an array.
 * Old store files on disk may be missing fields added after initial creation.
 */
function normalizeStore(raw: Partial<AppStore>): AppStore {
  return {
    users: coerceArray(raw.users),
    sessions: coerceArray(raw.sessions),
    joinDrafts: coerceArray(raw.joinDrafts),
    referralCodes: coerceArray(raw.referralCodes),
    accountRecoveryEvents: coerceArray(raw.accountRecoveryEvents),
    gists: coerceArray(raw.gists),
    gistRelations: coerceArray(raw.gistRelations),
    gistReactions: coerceArray(raw.gistReactions),
    gistComments: coerceArray(raw.gistComments),
    gistReports: coerceArray<AppStore["gistReports"][number]>(raw.gistReports).map((report) => ({
      status: "open",
      triagedAt: null,
      resolvedAt: null,
      resolvedByOgaUserId: null,
      resolutionNotes: null,
      ...report,
    })),
    surveys: coerceArray(raw.surveys),
    surveyOptions: coerceArray(raw.surveyOptions),
    surveyVotes: coerceArray(raw.surveyVotes),
    alerts: coerceArray(raw.alerts),
    savedGists: coerceArray(raw.savedGists),
    contactOgaMessages: coerceArray(raw.contactOgaMessages),
    intelSubmissions: coerceArray(raw.intelSubmissions),
    pinnedGists: coerceArray(raw.pinnedGists),
    predictionModules: coerceArray(raw.predictionModules),
    userPointsLedger: coerceArray(raw.userPointsLedger),
    userTrustProfiles: coerceArray(raw.userTrustProfiles),
    ogaActions: coerceArray(raw.ogaActions),
    locationCache: coerceArray(raw.locationCache),
    featureFlags: coerceArray(raw.featureFlags),
  };
}

export async function getUserReferralsBundle(userId: string) {
  const store = await readStore();
  const user = getUserById(store, userId);

  if (!user) {
    throw new Error("User no dey.");
  }

  const issued = store.referralCodes
    .filter((code) => code.createdByUserId === userId)
    .slice()
    .sort((left, right) => {
      const leftDate = left.usedAt ?? left.expiresAt ?? "";
      const rightDate = right.usedAt ?? right.expiresAt ?? "";
      return rightDate.localeCompare(leftDate);
    });

  const allowance = user.isOga ? Infinity : DEFAULT_REFERRAL_ALLOWANCE;
  const usedCount = issued.filter((code) => Boolean(code.usedByUserId)).length;
  const issuedCount = issued.length;
  const leftCount = user.isOga ? Infinity : Math.max(0, allowance - issuedCount);

  return {
    viewer: toViewer(user),
    allowance,
    issuedCount,
    usedCount,
    leftCount,
    codes: issued.map((code) => ({
      id: code.id,
      code: code.code,
      status: code.usedByUserId ? ("used" as const) : ("unused" as const),
    })),
  };
}

export async function generateUserReferralCode(userId: string) {
  return mutateStore((store) => {
    const user = getUserById(store, userId);

    if (!user) {
      throw new Error("User no dey.");
    }

    if (user.isOga) {
      throw new Error("Use oga Growth dashboard for referrals.");
    }

    const issuedCount = store.referralCodes.filter(
      (code) => code.createdByUserId === userId,
    ).length;

    if (issuedCount >= DEFAULT_REFERRAL_ALLOWANCE) {
      throw new Error("You don finish your lifetime invites.");
    }

    let codeValue = "";
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const candidate = createReferralCode();
      const exists = store.referralCodes.some(
        (code) => code.code.toLowerCase() === candidate.toLowerCase(),
      );
      if (!exists) {
        codeValue = candidate;
        break;
      }
    }

    if (!codeValue) {
      throw new Error("Referral code no generate. Try again.");
    }

    const record = {
      id: makeId("ref"),
      code: codeValue,
      createdByUserId: userId,
      usedByUserId: null,
      usedAt: null,
      expiresAt: null,
      isActive: true,
    };

    store.referralCodes.unshift(record);
    return record;
  });
}

export async function readStore(): Promise<AppStore> {
  if (isPostgresStoreConfigured()) {
    return normalizeStore(await loadPostgresStore());
  }

  const legacy = await getLegacyStorePersistence();
  return normalizeStore(await legacy.loadLegacyFileStore());
}

export async function mutateStore<T>(
  operation: (store: AppStore) => Promise<T> | T,
) {
  if (isPostgresStoreConfigured()) {
    return mutatePostgresStore((store) => operation(store));
  }

  const next = writeChain.then(async () => {
    const store = await readStore();
    const result = await operation(store);
    const legacy = await getLegacyStorePersistence();
    await legacy.saveLegacyFileStore(store);
    return result;
  });

  writeChain = next.then(
    () => undefined,
    () => undefined,
  );

  return next;
}

export async function resetDemoStore() {
  const seeded = buildSeedStore();

  if (isPostgresStoreConfigured()) {
    await replacePostgresStore(seeded);
    return;
  }

  const legacy = await getLegacyStorePersistence();
  await legacy.resetLegacyFileStore(seeded);
}

function getUserById(store: AppStore, userId: string) {
  return store.users.find((user) => user.id === userId) ?? null;
}

function getTrustProfile(store: AppStore, userId: string) {
  return (
    store.userTrustProfiles.find((profile) => profile.userId === userId) ?? null
  );
}

function getSavedGistRecord(store: AppStore, userId: string, gistId: string) {
  return (
    store.savedGists.find(
      (entry) => entry.userId === userId && entry.gistId === gistId,
    ) ?? null
  );
}

function getPinnedGistRecord(store: AppStore, gistId: string) {
  return store.pinnedGists.find((entry) => entry.gistId === gistId) ?? null;
}

function touchUser(user: UserRecord) {
  user.lastActiveAt = new Date().toISOString();
}

function toViewer(user: UserRecord): Viewer {
  return {
    id: user.id,
    username: user.username,
    tier: user.tier,
    pointsBalance: user.pointsBalance,
    homeState: user.homeState,
    isOga: user.isOga,
    comotTagged: user.comotTagged,
    location:
      user.homeAreaDisplay &&
      user.homeAreaBucket &&
      user.homeAdmin2Name &&
      user.homeAdmin2Type &&
      user.locationConfidence !== null
        ? {
            displayLocality: user.homeAreaDisplay,
            areaBucket: user.homeAreaBucket,
            admin2Name: user.homeAdmin2Name,
            admin2Type: user.homeAdmin2Type,
            stateName: user.homeState,
            confidenceScore: user.locationConfidence,
          }
        : null,
  };
}

function addAlert(
  store: AppStore,
  input: {
    userId: string;
    type: "comment" | "activity" | "survey" | "points" | "account";
    title: string;
    body: string;
    link: string;
  },
) {
  store.alerts.unshift({
    id: makeId("alt"),
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    link: input.link,
    readAt: null,
    createdAt: new Date().toISOString(),
  });
}

function addPoints(
  store: AppStore,
  userId: string,
  eventType:
    | "join"
    | "drop-gist"
    | "received-reaction"
    | "received-comment"
    | "voted-survey"
    | "milestone"
    | "report-validated",
  pointsDelta: number,
  metadata: Record<string, string | number | boolean | null>,
) {
  const user = getUserById(store, userId);

  if (!user) {
    return;
  }

  user.pointsBalance += pointsDelta;
  user.tier = getTierByPoints(user.pointsBalance);

  store.userPointsLedger.unshift({
    id: makeId("pt"),
    userId,
    eventType,
    pointsDelta,
    metadata,
    createdAt: new Date().toISOString(),
  });

  const nextTier = getNextTier(user.pointsBalance);
  if (nextTier && user.pointsBalance >= nextTier.minPoints) {
    addAlert(store, {
      userId,
      type: "points",
      title: `${nextTier.tier} reached`,
      body: `You don hit ${nextTier.minPoints} GistPoints.`,
      link: "/score",
    });
  }
}

function buildReachLabel(viewer: Viewer | null, gist: AppStore["gists"][number]) {
  if (!viewer?.location) {
    return gist.stateName === viewer?.homeState ? "State reach" : "Nigeria reach";
  }

  if (gist.areaBucket === viewer.location.areaBucket) {
    return "Street reach";
  }

  if (gist.admin2Name === viewer.location.admin2Name) {
    return "Area reach";
  }

  if (gist.stateName === viewer.homeState) {
    return "State reach";
  }

  return "Nigeria reach";
}

function getViewerLevelForGist(
  viewer: Viewer | null,
  gist: AppStore["gists"][number],
): GistCardView["viewerLevel"] {
  if (!viewer?.location) {
    return gist.stateName === viewer?.homeState ? "state" : "nigeria";
  }

  if (gist.areaBucket === viewer.location.areaBucket) {
    return "my-street";
  }

  if (gist.admin2Name === viewer.location.admin2Name) {
    return "my-area";
  }

  if (gist.stateName === viewer.homeState) {
    return "state";
  }

  return "nigeria";
}

function buildTopCounts(values: string[], limit = 3) {
  return Object.entries(
    values.reduce<Record<string, number>>((accumulator, value) => {
      accumulator[value] = (accumulator[value] ?? 0) + 1;
      return accumulator;
    }, {}),
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit);
}

function isWithinLastDay(dateString: string) {
  return parseISO(dateString) > subDays(new Date(), 1);
}

function buildModerationStatus(
  user: UserRecord,
  trust:
    | {
        trustScore: number;
        personalDataStrikes: number;
        fakeLocationStrikes: number;
      }
    | null
    | undefined,
) {
  if (user.comotTagged || (trust && trust.trustScore < 58)) {
    return "Comot Tag candidate";
  }

  if (
    trust &&
    (trust.personalDataStrikes > 0 ||
      trust.fakeLocationStrikes > 0 ||
      trust.trustScore < 72)
  ) {
    return "Watch";
  }

  return "Steady";
}

function buildGistCardView(
  store: AppStore,
  gist: AppStore["gists"][number],
  viewerId?: string | null,
  viewerLevelOverride?: GistCardView["viewerLevel"],
): GistCardView {
  const author = getUserById(store, gist.authorUserId);
  const viewerUser = viewerId ? getUserById(store, viewerId) : null;
  const viewer = viewerUser ? toViewer(viewerUser) : null;
  const reactions = store.gistReactions.filter((reaction) => reaction.gistId === gist.id);
  const viewerReaction =
    viewerId
      ? reactions.find((reaction) => reaction.userId === viewerId)?.type ?? null
      : null;

  const parentRelation = (store.gistRelations ?? []).find(
    (rel) => rel.childGistId === gist.id,
  ) ?? null;

  return {
    id: gist.id,
    username: author?.username ?? "Anonymous",
    authorTier: author?.tier ?? "New Member",
    locationLabel: gist.areaDisplay,
    areaLabel: gist.areaDisplay,
    broaderAreaLabel: gist.admin2Name,
    stateLabel: gist.stateName,
    reachLabel: buildReachLabel(viewer, gist),
    viewerLevel: viewerLevelOverride ?? getViewerLevelForGist(viewer, gist),
    tag: gist.tag,
    body: gist.body,
    translationText: gist.translationText,
    commentsCount: gist.commentsCount,
    followUpCount: gist.followUpCount ?? 0,
    reportsCount: gist.reportsCount,
    createdAt: gist.createdAt,
    reactionTotals: aggregateReactions(reactions),
    viewerReaction,
    isSaved: viewerId ? Boolean(getSavedGistRecord(store, viewerId, gist.id)) : false,
    pinnedByOgaPriority: getPinnedGistRecord(store, gist.id)?.priority ?? null,
    status: gist.status,
    parentGistId: parentRelation?.parentGistId ?? null,
    parentRelationType: parentRelation?.relationType ?? null,
  };
}

function getSurveyView(
  store: AppStore,
  surveyId: string,
  viewerId?: string | null,
): SurveyView | null {
  const survey = store.surveys.find((entry) => entry.id === surveyId);

  if (!survey) {
    return null;
  }

  const viewerUser = viewerId ? getUserById(store, viewerId) : null;

  if (viewerUser && !isViewerWithinSurveyScope(toViewer(viewerUser), survey)) {
    return null;
  }

  const options = store.surveyOptions.filter((entry) => entry.surveyId === surveyId);
  const totalVotes = options.reduce((sum, option) => sum + option.votesCount, 0);
  const viewerVote = viewerId
    ? store.surveyVotes.find(
        (vote) => vote.surveyId === surveyId && vote.userId === viewerId,
      ) ?? null
    : null;
  const runtimeStatus = getRuntimeSurveyStatus(survey);

  return {
    id: survey.id,
    question: survey.question,
    scopeLabel:
      survey.scopeType === "nigeria"
        ? "Nigeria"
        : survey.scopeValue ?? survey.scopeType,
    status: runtimeStatus,
    pinned: survey.pinned,
    startsAt: survey.startsAt,
    endsAt: survey.endsAt,
    hasVoted: Boolean(viewerVote),
    viewerOptionId: viewerVote?.optionId ?? null,
    options: options.map((option) => ({
      id: option.id,
      label: option.label,
      votesCount: option.votesCount,
      percentage: totalVotes === 0 ? 0 : option.votesCount / totalVotes,
    })),
    totalVotes,
    pointsReward: survey.pointsReward,
  };
}

function getRuntimeSurveyStatus(
  survey: AppStore["surveys"][number],
): AppStore["surveys"][number]["status"] {
  if (survey.status !== "live") {
    return survey.status;
  }

  if (parseISO(survey.endsAt) <= new Date()) {
    return "closed";
  }

  return "live";
}

function normalizeScopeValue(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function isViewerWithinSurveyScope(
  viewer: Viewer,
  survey: AppStore["surveys"][number],
) {
  if (survey.scopeType === "nigeria") {
    return true;
  }

  const scopeValue = normalizeScopeValue(survey.scopeValue);

  if (!scopeValue) {
    return false;
  }

  if (survey.scopeType === "state") {
    return normalizeScopeValue(viewer.homeState) === scopeValue;
  }

  if (!viewer.location) {
    return false;
  }

  const areaCandidates = [
    viewer.location.displayLocality,
    viewer.location.areaBucket,
    viewer.location.admin2Name,
    `${viewer.location.displayLocality}, ${viewer.homeState}`,
    `${viewer.location.admin2Name}, ${viewer.homeState}`,
  ].map((value) => normalizeScopeValue(value));

  return areaCandidates.includes(scopeValue);
}

function getPredictionModuleView(
  store: AppStore,
): PredictionModuleView | null {
  const predictionsEnabled = store.featureFlags.find(
    (flag) => flag.key === "predictions",
  )?.enabled;

  if (!predictionsEnabled) {
    return null;
  }

  const predictionModule = store.predictionModules.find(
    (entry) => entry.status === "live",
  );

  if (!predictionModule) {
    return null;
  }

  return {
    id: predictionModule.id,
    title: predictionModule.title,
    body: predictionModule.body,
    kicker: predictionModule.kicker,
    status: predictionModule.status,
  };
}

export async function getFeatureFlags() {
  const store = await readStore();

  return Object.fromEntries(
    store.featureFlags.map((flag) => [flag.key, flag.enabled]),
  ) as Record<string, boolean>;
}

export async function getJoinDraft(joinDraftId: string | null) {
  if (!joinDraftId) {
    return null;
  }

  const store = await readStore();
  return store.joinDrafts.find((draft) => draft.id === joinDraftId) ?? null;
}

export async function beginJoinDraft(code: string) {
  return mutateStore((store) => {
    const referral = store.referralCodes.find(
      (entry) =>
        entry.code.toLowerCase() === code.toLowerCase() &&
        entry.isActive &&
        !entry.usedByUserId &&
        (!entry.expiresAt || parseISO(entry.expiresAt) > new Date()),
    );

    if (!referral) {
      throw new Error("That referral code no clear.");
    }

    const draft = {
      id: makeId("jnd"),
      referralCodeId: referral.id,
      referralCode: referral.code,
      username: null,
      usernameNormalized: null,
      pinHash: null,
      accountCode: null,
      accountCodeHash: null,
      state: null,
      ageRange: null,
      gender: null,
      createdAt: new Date().toISOString(),
    };

    store.joinDrafts = store.joinDrafts.filter(
      (entry) => entry.referralCodeId !== referral.id,
    );
    store.joinDrafts.unshift(draft);
    return draft;
  });
}

export async function setJoinDraftUsername(joinDraftId: string, username: string) {
  return mutateStore((store) => {
    const draft = store.joinDrafts.find((entry) => entry.id === joinDraftId);

    if (!draft) {
      throw new Error("Your join session don expire. Start again.");
    }

    const normalized = normalizeUsername(username);
    const taken = store.users.some(
      (user) => user.usernameNormalized === normalized,
    );

    if (taken) {
      throw new Error("That username don already dey.");
    }

    draft.username = username.trim();
    draft.usernameNormalized = normalized;
    return draft;
  });
}

export async function setJoinDraftPin(joinDraftId: string, pin: string) {
  return mutateStore((store) => {
    const draft = store.joinDrafts.find((entry) => entry.id === joinDraftId);

    if (!draft) {
      throw new Error("Your join session don expire. Start again.");
    }

    draft.pinHash = hashSecretValue(pin);

    if (!draft.accountCode) {
      const accountCode = createAccountCode();
      draft.accountCode = accountCode;
      draft.accountCodeHash = hashSecretValue(accountCode);
    }

    return draft;
  });
}

export async function setJoinDraftBasics(
  joinDraftId: string,
  input: { state: string; ageRange: UserRecord["ageRange"]; gender: UserRecord["gender"] },
) {
  return mutateStore((store) => {
    const draft = store.joinDrafts.find((entry) => entry.id === joinDraftId);

    if (!draft) {
      throw new Error("Your join session don expire. Start again.");
    }

    draft.state = input.state;
    draft.ageRange = input.ageRange;
    draft.gender = input.gender;
    return draft;
  });
}

export async function completeJoinDraft(joinDraftId: string) {
  return mutateStore((store) => {
    const draftIndex = store.joinDrafts.findIndex((entry) => entry.id === joinDraftId);
    const draft = store.joinDrafts[draftIndex];

    if (
      !draft ||
      !draft.username ||
      !draft.usernameNormalized ||
      !draft.pinHash ||
      !draft.accountCodeHash ||
      !draft.state ||
      !draft.ageRange ||
      !draft.gender
    ) {
      throw new Error("Complete the join steps first.");
    }

    const referral = store.referralCodes.find(
      (entry) => entry.id === draft.referralCodeId,
    );

    if (!referral || !referral.isActive || referral.usedByUserId) {
      throw new Error("That referral code don finish.");
    }

    const user: UserRecord = {
      id: makeId("usr"),
      username: draft.username,
      usernameNormalized: draft.usernameNormalized,
      pinHash: draft.pinHash,
      accountCodeHash: draft.accountCodeHash,
      homeState: draft.state,
      ageRange: draft.ageRange,
      gender: draft.gender,
      tier: "New Member",
      pointsBalance: 20,
      isOga: false,
      comotTagged: false,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      homeAreaDisplay: null,
      homeAreaBucket: null,
      homeAdmin2Name: null,
      homeAdmin2Type: null,
      locationConfidence: null,
      referredByUserId: referral.createdByUserId,
      referralCodeUsed: referral.code,
      devRecoveryCode: null,
    };

    store.users.unshift(user);
    referral.usedByUserId = user.id;
    referral.usedAt = new Date().toISOString();
    referral.isActive = false;
    store.joinDrafts.splice(draftIndex, 1);

    store.userTrustProfiles.unshift({
      userId: user.id,
      trustScore: 70,
      personalDataStrikes: 0,
      fakeLocationStrikes: 0,
      validReportCount: 0,
      invalidReportCount: 0,
      lastUpdatedAt: new Date().toISOString(),
    });

    addPoints(store, user.id, "join", 0, { flow: "referral-gated" });
    addAlert(store, {
      userId: user.id,
      type: "account",
      title: "Welcome to Mata",
      body: "No full names, no phone numbers, no addresses.",
      link: "/mata",
    });

    return { userId: user.id, accountCode: draft.accountCode ?? "" };
  });
}

export async function createSession(userId: string) {
  return mutateStore((store) => {
    const token = randomToken();
    store.sessions.unshift({
      id: makeId("ses"),
      userId,
      tokenHash: hashValue(token),
      createdAt: new Date().toISOString(),
      expiresAt: daysFromNow(30),
      lastSeenAt: new Date().toISOString(),
    });
    return token;
  });
}

export async function getUserBySessionToken(token: string | null) {
  if (!token) {
    return null;
  }

  const store = await readStore();
  const session = store.sessions.find(
    (entry) =>
      entry.tokenHash === hashValue(token) &&
      parseISO(entry.expiresAt) > new Date(),
  );

  if (!session) {
    return null;
  }

  const user = getUserById(store, session.userId);
  return user ? toViewer(user) : null;
}

export async function recoverSession(accountCode: string, pin: string) {
  return mutateStore((store) => {
    const user = store.users.find(
      (entry) =>
        verifySecretValue(accountCode.trim(), entry.accountCodeHash) &&
        verifySecretValue(pin.trim(), entry.pinHash),
    );

    store.accountRecoveryEvents.unshift({
      id: makeId("rcv"),
      userId: user?.id ?? "unknown",
      success: Boolean(user),
      createdAt: new Date().toISOString(),
    });

    if (!user) {
      throw new Error("Account Code or PIN no match.");
    }

    touchUser(user);
    const token = randomToken();
    store.sessions.unshift({
      id: makeId("ses"),
      userId: user.id,
      tokenHash: hashValue(token),
      createdAt: new Date().toISOString(),
      expiresAt: daysFromNow(30),
      lastSeenAt: new Date().toISOString(),
    });
    return { token, user: toViewer(user) };
  });
}

export async function loginWithUsernameAndPin(username: string, pin: string) {
  return mutateStore((store) => {
    const normalized = username.trim().toLowerCase();
    const user = store.users.find(
      (entry) =>
        entry.usernameNormalized === normalized &&
        verifySecretValue(pin.trim(), entry.pinHash),
    );

    if (!user) {
      throw new Error("Username or PIN no match. Try again.");
    }

    touchUser(user);
    const token = randomToken();
    store.sessions.unshift({
      id: makeId("ses"),
      userId: user.id,
      tokenHash: hashValue(token),
      createdAt: new Date().toISOString(),
      expiresAt: daysFromNow(30),
      lastSeenAt: new Date().toISOString(),
    });
    return { token, user: toViewer(user) };
  });
}

export async function deleteSession(token: string | null) {
  if (!token) {
    return;
  }

  await mutateStore((store) => {
    store.sessions = store.sessions.filter(
      (session) => session.tokenHash !== hashValue(token),
    );
  });
}

export async function saveUserLocation(userId: string, location: LocationSnapshot) {
  return mutateStore((store) => {
    const user = getUserById(store, userId);

    if (!user) {
      throw new Error("User no dey.");
    }

    user.homeState = location.stateName;
    user.homeAreaDisplay = location.displayLocality;
    user.homeAreaBucket = location.areaBucket;
    user.homeAdmin2Name = location.admin2Name;
    user.homeAdmin2Type = location.admin2Type;
    user.locationConfidence = location.confidenceScore;
    touchUser(user);
    return toViewer(user);
  });
}

export async function getFeedBundle(params: {
  viewerId: string;
  level: "my-street" | "my-area" | "state" | "nigeria" | "hot";
  tag: string;
  sort?: "smart" | "recent";
}) {
  const store = await readStore();
  const pinnedEntries = Array.isArray(store.pinnedGists) ? store.pinnedGists : [];
  const user = getUserById(store, params.viewerId);

  if (!user) {
    throw new Error("Viewer no dey.");
  }

  const viewer = toViewer(user);
  const trustByUser = new Map(
    store.userTrustProfiles.map((profile) => [profile.userId, profile.trustScore]),
  );
  const predictionSlot = getPredictionModuleView(store);

  let gists = store.gists.filter((gist) => gist.status === "active");

  if (params.tag !== "All") {
    gists = gists.filter((gist) => gist.tag === params.tag);
  }

  gists = gists.filter((gist) => {
    if (params.level === "my-street") {
      return viewer.location
        ? gist.areaBucket === viewer.location.areaBucket
        : gist.stateName === viewer.homeState;
    }

    if (params.level === "my-area") {
      return viewer.location
        ? gist.admin2Name === viewer.location.admin2Name
        : gist.stateName === viewer.homeState;
    }

    if (params.level === "state") {
      return gist.stateName === viewer.homeState;
    }

    return true;
  });

  const ranked = gists
    .map((gist) => {
      const reactionsCount = store.gistReactions.filter(
        (reaction) => reaction.gistId === gist.id,
      ).length;
      const commentsCount = store.gistComments.filter(
        (comment) => comment.gistId === gist.id && comment.status === "active",
      ).length;
      const reportsCount = store.gistReports.filter(
        (report) => report.gistId === gist.id,
      ).length;
      const authorTrust = trustByUser.get(gist.authorUserId) ?? 70;

      return {
        gist,
        score: computeFeedScore({
          gist,
          reactionsCount,
          commentsCount,
          reportsCount,
          trustScore: authorTrust,
          level: params.level,
        }),
      };
    })
    .sort((left, right) => {
      if (params.sort === "recent") {
        return +new Date(right.gist.createdAt) - +new Date(left.gist.createdAt);
      }

      return right.score - left.score;
    })
    .map(({ gist }) =>
      buildGistCardView(store, gist, params.viewerId, params.level),
    );

  const localSource = store.gists.filter((gist) => {
    if (gist.status !== "active") {
      return false;
    }

    if (viewer.location) {
      return gist.admin2Name === viewer.location.admin2Name;
    }

    return gist.stateName === viewer.homeState;
  });
  const recentRanked = ranked.filter((gist) => isWithinLastDay(gist.createdAt));
  const spotlightTag = buildTopCounts(gists.map((gist) => gist.tag), 1)[0]?.[0] ?? "General";
  const hotspotArea =
    buildTopCounts(gists.map((gist) => gist.areaDisplay), 1)[0]?.[0] ??
    (viewer.location?.displayLocality ?? viewer.homeState);

  const activeSurvey = store.surveys.find(
    (survey) =>
      getRuntimeSurveyStatus(survey) === "live" &&
      survey.pinned &&
      isViewerWithinSurveyScope(viewer, survey),
  );
  const pinnedGistIds = new Set(pinnedEntries.map((entry) => entry.gistId));
  const pinnedGists = pinnedEntries
    .slice()
    .sort((left, right) => left.priority - right.priority)
    .map((entry) => store.gists.find((gist) => gist.id === entry.gistId) ?? null)
    .filter(
      (gist): gist is NonNullable<AppStore["gists"][number]> =>
        gist !== null &&
        gist.status === "active" &&
        gists.some((candidate) => candidate.id === gist.id),
    )
    .map((gist) => buildGistCardView(store, gist, params.viewerId, params.level));
  const feedGists = ranked.filter((gist) => !pinnedGistIds.has(gist.id));

  return {
    viewer,
    level: params.level,
    sort: params.sort ?? "smart",
    gists: feedGists,
    pinnedGists,
    activeSurvey: activeSurvey
      ? getSurveyView(store, activeSurvey.id, params.viewerId)
      : null,
    predictionSlot,
    feedSummary: {
      totalCount: feedGists.length,
      freshCount: recentRanked.length,
      localLabel: viewer.location?.displayLocality ?? viewer.homeState,
      broaderAreaLabel: viewer.location?.admin2Name ?? viewer.homeState,
      coverageText: viewer.location
        ? `Na ${viewer.location.displayLocality} people dey yarn first here.`
        : `We still dey use ${viewer.homeState} till your first Drop Gist sharpens your local Mata.`,
      hotspotArea,
      spotlightTag,
      nearbyMovement: buildTopCounts(localSource.map((gist) => gist.tag)),
      topAreas: buildTopCounts(gists.map((gist) => gist.areaDisplay)),
    },
    leaderboardTeaser: buildLeaderboardFromLedger({
      users: store.users.filter((entry) => !entry.isOga),
      ledger: store.userPointsLedger,
      mode: "monthly",
    }).slice(0, 5),
    flags: Object.fromEntries(
      store.featureFlags.map((flag) => [flag.key, flag.enabled]),
    ) as Record<string, boolean>,
  };
}

export async function getGistBundle(gistId: string, viewerId: string) {
  const store = await readStore();
  const gist = store.gists.find((entry) => entry.id === gistId);
  const user = getUserById(store, viewerId);

  if (!gist || !user) {
    return null;
  }

  const viewer = toViewer(user);
  const viewerLevel = getViewerLevelForGist(viewer, gist);
  const nearbyGists = store.gists
    .filter(
      (entry) =>
        entry.id !== gistId &&
        entry.status === "active" &&
        (entry.admin2Name === gist.admin2Name || entry.stateName === gist.stateName),
    )
    .sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt))
    .slice(0, 3)
    .map((entry) => buildGistCardView(store, entry, viewerId));

  return {
    viewer,
    viewerLevel,
    gist: buildGistCardView(store, gist, viewerId, viewerLevel),
    comments: store.gistComments
      .filter((comment) => comment.gistId === gistId && comment.status === "active")
      .sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt))
      .map((comment) => ({
        id: comment.id,
        username: getUserById(store, comment.authorUserId)?.username ?? "Anonymous",
        body: comment.body,
        createdAt: comment.createdAt,
        isAuthor: comment.authorUserId === viewerId,
      })),
    postContext: {
      area: gist.areaDisplay,
      broaderArea: gist.admin2Name,
      state: gist.stateName,
      reach: buildReachLabel(viewer, gist),
      nearbyMovement: buildTopCounts(
        nearbyGists.map((entry) => entry.tag),
      ),
      nearbyGists,
    },
    activeSurvey: (() => {
      const survey = store.surveys.find(
        (entry) =>
          getRuntimeSurveyStatus(entry) === "live" &&
          entry.pinned &&
          isViewerWithinSurveyScope(viewer, entry),
      );
      return survey ? getSurveyView(store, survey.id, viewerId) : null;
    })(),
    followUps: (store.gistRelations ?? [])
      .filter((rel) => rel.parentGistId === gistId)
      .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
      .map((rel) => {
        const child = store.gists.find(
          (g) => g.id === rel.childGistId && g.status === "active",
        );
        if (!child) return null;
        return {
          ...buildGistCardView(store, child, viewerId),
          relationType: rel.relationType,
        };
      })
      .filter(Boolean) as Array<import("@/lib/domain/types").GistCardView & { relationType: string }>,
  };
}

export async function dropGist(params: {
  viewerId: string;
  body: string;
  tag: GistCardView["tag"];
  location: LocationSnapshot;
}) {
  return mutateStore((store) => {
    const user = getUserById(store, params.viewerId);

    if (!user) {
      throw new Error("Your session no clear again.");
    }

    const moderation = detectPersonalData(params.body);
    if (moderation.blocked) {
      throw new Error(moderation.message ?? "This gist no fit drop.");
    }

    const todayCount = store.gists.filter(
      (gist) =>
        gist.authorUserId === params.viewerId &&
        gist.status === "active" &&
        parseISO(gist.createdAt) >= startOfDay(new Date()),
    ).length;

    if (todayCount >= MAX_GISTS_PER_DAY) {
      throw new Error("You don reach today gist limit. Try again tomorrow.");
    }

    const gist = {
      id: makeId("gst"),
      authorUserId: params.viewerId,
      body: params.body.trim(),
      tag: params.tag,
      areaDisplay: params.location.displayLocality,
      areaBucket: params.location.areaBucket,
      admin2Name: params.location.admin2Name,
      admin2Type: params.location.admin2Type,
      stateName: params.location.stateName,
      feedVisibilityScore: 0.71,
      translationText: null,
      commentsCount: 0,
      reactionsCount: 0,
      reportsCount: 0,
      followUpCount: 0,
      status: "active" as const,
      createdAt: new Date().toISOString(),
    };

    store.gists.unshift(gist);
    user.homeState = params.location.stateName;
    user.homeAreaDisplay = params.location.displayLocality;
    user.homeAreaBucket = params.location.areaBucket;
    user.homeAdmin2Name = params.location.admin2Name;
    user.homeAdmin2Type = params.location.admin2Type;
    user.locationConfidence = params.location.confidenceScore;
    touchUser(user);

    addPoints(store, params.viewerId, "drop-gist", 18, { gistId: gist.id });
    return gist.id;
  });
}

export async function dropFollowUpGist(params: {
  viewerId: string;
  parentGistId: string;
  relationType: import("@/lib/domain/types").GistRelationType;
  body: string;
  tag: GistCardView["tag"];
  location: LocationSnapshot;
}) {
  return mutateStore((store) => {
    const user = getUserById(store, params.viewerId);

    if (!user) {
      throw new Error("Your session no clear again.");
    }

    const parentGist = store.gists.find((g) => g.id === params.parentGistId);
    if (!parentGist || parentGist.status !== "active") {
      throw new Error("The gist you dey follow up no dey again.");
    }

    const moderation = detectPersonalData(params.body);
    if (moderation.blocked) {
      throw new Error(moderation.message ?? "This gist no fit drop.");
    }

    const todayCount = store.gists.filter(
      (gist) =>
        gist.authorUserId === params.viewerId &&
        gist.status === "active" &&
        parseISO(gist.createdAt) >= startOfDay(new Date()),
    ).length;

    if (todayCount >= MAX_GISTS_PER_DAY) {
      throw new Error("You don reach today gist limit. Try again tomorrow.");
    }

    const childGist = {
      id: makeId("gst"),
      authorUserId: params.viewerId,
      body: params.body.trim(),
      tag: params.tag,
      areaDisplay: params.location.displayLocality,
      areaBucket: params.location.areaBucket,
      admin2Name: params.location.admin2Name,
      admin2Type: params.location.admin2Type,
      stateName: params.location.stateName,
      feedVisibilityScore: 0.74,
      translationText: null,
      commentsCount: 0,
      reactionsCount: 0,
      reportsCount: 0,
      followUpCount: 0,
      status: "active" as const,
      createdAt: new Date().toISOString(),
    };

    store.gists.unshift(childGist);

    store.gistRelations = store.gistRelations ?? [];
    store.gistRelations.unshift({
      id: makeId("rel"),
      childGistId: childGist.id,
      parentGistId: params.parentGistId,
      relationType: params.relationType,
      createdAt: new Date().toISOString(),
    });

    // Increment follow-up count on the parent gist
    parentGist.followUpCount = (parentGist.followUpCount ?? 0) + 1;

    user.homeState = params.location.stateName;
    user.homeAreaDisplay = params.location.displayLocality;
    user.homeAreaBucket = params.location.areaBucket;
    user.homeAdmin2Name = params.location.admin2Name;
    user.homeAdmin2Type = params.location.admin2Type;
    user.locationConfidence = params.location.confidenceScore;
    touchUser(user);

    addPoints(store, params.viewerId, "drop-gist", 18, { gistId: childGist.id });
    return childGist.id;
  });
}

export async function getMatterChain(
  parentGistId: string,
  viewerId: string | null,
) {
  const store = await readStore();

  const parentGist = store.gists.find((g) => g.id === parentGistId);
  if (!parentGist) {
    return null;
  }

  const relations = (store.gistRelations ?? []).filter(
    (rel) => rel.parentGistId === parentGistId,
  );

  const followUps = relations
    .map((rel) => {
      const gist = store.gists.find(
        (g) => g.id === rel.childGistId && g.status === "active",
      );
      if (!gist) return null;
      return {
        ...buildGistCardView(store, gist, viewerId),
        relationType: rel.relationType,
      };
    })
    .filter(Boolean);

  return {
    parent: buildGistCardView(store, parentGist, viewerId),
    followUps,
  };
}

export async function addCommentToGist(params: {
  viewerId: string;
  gistId: string;
  body: string;
}) {
  return mutateStore((store) => {
    const gist = store.gists.find((entry) => entry.id === params.gistId);
    const user = getUserById(store, params.viewerId);

    if (!gist || !user) {
      throw new Error("That gist no show.");
    }

    const moderation = detectPersonalData(params.body);
    if (moderation.blocked) {
      throw new Error(moderation.message ?? "Comment no fit drop.");
    }

    const userCommentCount = store.gistComments.filter(
      (comment) =>
        comment.gistId === params.gistId &&
        comment.authorUserId === params.viewerId &&
        comment.status === "active",
    ).length;

    if (userCommentCount >= MAX_COMMENTS_PER_GIST_PER_USER) {
      throw new Error("Na three comments max per gist for now.");
    }

    const comment = {
      id: makeId("cmt"),
      gistId: params.gistId,
      authorUserId: params.viewerId,
      body: params.body.trim(),
      status: "active" as const,
      createdAt: new Date().toISOString(),
      parentCommentId: null,
    };

    store.gistComments.unshift(comment);
    gist.commentsCount += 1;
    touchUser(user);

    if (gist.authorUserId !== params.viewerId) {
      addAlert(store, {
        userId: gist.authorUserId,
        type: "comment",
        title: "New comment on your Gist",
        body: `${user.username} drop fresh comment.`,
        link: `/gist/${gist.id}`,
      });
      addPoints(store, gist.authorUserId, "received-comment", 4, {
        gistId: gist.id,
      });
    }

    return comment.id;
  });
}

export async function toggleGistReaction(params: {
  viewerId: string;
  gistId: string;
  type: "wahala" | "omo" | "sharp";
}) {
  return mutateStore((store) => {
    const gist = store.gists.find((entry) => entry.id === params.gistId);
    const user = getUserById(store, params.viewerId);

    if (!gist || !user) {
      throw new Error("That gist no show.");
    }

    const existing = store.gistReactions.find(
      (reaction) =>
        reaction.gistId === params.gistId && reaction.userId === params.viewerId,
    );

    if (existing?.type === params.type) {
      store.gistReactions = store.gistReactions.filter(
        (reaction) => reaction.id !== existing.id,
      );
    } else if (existing) {
      existing.type = params.type;
    } else {
      store.gistReactions.unshift({
        id: makeId("rct"),
        gistId: params.gistId,
        userId: params.viewerId,
        type: params.type,
        createdAt: new Date().toISOString(),
      });

      if (gist.authorUserId !== params.viewerId) {
        addAlert(store, {
          userId: gist.authorUserId,
          type: "activity",
          title: "Your gist get fresh reaction",
          body: `${user.username} react with ${
            REACTION_OPTIONS.find((entry) => entry.value === params.type)?.label
          }.`,
          link: `/gist/${gist.id}`,
        });
        addPoints(store, gist.authorUserId, "received-reaction", 2, {
          gistId: gist.id,
        });
      }
    }

    gist.reactionsCount = store.gistReactions.filter(
      (reaction) => reaction.gistId === params.gistId,
    ).length;
  });
}

export async function reportGist(params: {
  viewerId: string;
  gistId: string;
  type: "general" | "personal-data" | "fake-location";
  reasonText?: string;
}) {
  return mutateStore((store) => {
    const gist = store.gists.find((entry) => entry.id === params.gistId);
    const viewer = getUserById(store, params.viewerId);

    if (!gist || !viewer) {
      throw new Error("That gist no show.");
    }

    const author = getUserById(store, gist.authorUserId);
    if (author?.isOga) {
      throw new Error("Oga gist no dey open for reports.");
    }

    const duplicate = store.gistReports.find(
      (report) =>
        report.gistId === params.gistId &&
        report.reporterUserId === params.viewerId &&
        report.type === params.type,
    );

    if (duplicate) {
      throw new Error("You don already flag this gist like this.");
    }

    store.gistReports.unshift({
      id: makeId("rpt"),
      gistId: params.gistId,
      reporterUserId: params.viewerId,
      type: params.type,
      reasonText: params.reasonText?.trim() || null,
      status: "open",
      triagedAt: null,
      resolvedAt: null,
      resolvedByOgaUserId: null,
      resolutionNotes: null,
      createdAt: new Date().toISOString(),
    });
    gist.reportsCount += 1;

    const authorTrust = author ? getTrustProfile(store, author.id) : null;
    if (author && authorTrust) {
      if (params.type === "personal-data") {
        authorTrust.personalDataStrikes += 1;
        authorTrust.trustScore = Math.max(0, authorTrust.trustScore - 5);
      } else if (params.type === "fake-location") {
        authorTrust.fakeLocationStrikes += 1;
        authorTrust.trustScore = Math.max(0, authorTrust.trustScore - 4);
      } else {
        authorTrust.trustScore = Math.max(0, authorTrust.trustScore - 2);
      }

      authorTrust.lastUpdatedAt = new Date().toISOString();
      author.comotTagged =
        authorTrust.personalDataStrikes >= 2 ||
        authorTrust.fakeLocationStrikes >= 2 ||
        authorTrust.trustScore < 58;
    }
  });
}

export async function toggleSavedGist(params: {
  viewerId: string;
  gistId: string;
}) {
  return mutateStore((store) => {
    const gist = store.gists.find((entry) => entry.id === params.gistId);
    const user = getUserById(store, params.viewerId);

    if (!gist || !user || gist.status !== "active") {
      throw new Error("That gist no show.");
    }

    const existing = getSavedGistRecord(store, params.viewerId, params.gistId);

    if (existing) {
      store.savedGists = store.savedGists.filter((entry) => entry.id !== existing.id);
      return { saved: false };
    }

    store.savedGists.unshift({
      id: makeId("svg"),
      userId: params.viewerId,
      gistId: params.gistId,
      createdAt: new Date().toISOString(),
    });
    touchUser(user);
    return { saved: true };
  });
}

export async function createContactOgaMessage(params: {
  senderUserId: string;
  body: string;
  category?: AppStore["contactOgaMessages"][number]["category"];
  accountCodeReference?: string;
  intel?: {
    method: AppStore["intelSubmissions"][number]["method"];
    urgency: AppStore["intelSubmissions"][number]["urgency"];
    summary: string;
    locationHint?: string;
    linkedGistReference?: string;
  };
}) {
  return mutateStore((store) => {
    const sender = getUserById(store, params.senderUserId);

    if (!sender) {
      throw new Error("Your account no show.");
    }

    const message = {
      id: makeId("msg"),
      senderUserId: sender.id,
      senderIdentity: `@${sender.username}`,
      accountCodeReference: params.accountCodeReference?.trim() || null,
      category: params.intel ? "Intel" : (params.category ?? "General"),
      body: params.body.trim(),
      status: "unread" as const,
      createdAt: new Date().toISOString(),
      readAt: null,
    };

    store.contactOgaMessages.unshift(message);
    const intelSubmission = params.intel
      ? {
          id: makeId("int"),
          contactMessageId: message.id,
          senderUserId: sender.id,
          senderIdentity: message.senderIdentity,
          accountCodeReference: message.accountCodeReference,
          method: params.intel.method,
          urgency: params.intel.urgency,
          summary: params.intel.summary.trim(),
          body: message.body,
          locationHint: params.intel.locationHint?.trim() || null,
          linkedGistReference: params.intel.linkedGistReference?.trim() || null,
          status: "new" as const,
          createdAt: message.createdAt,
          reviewedAt: null,
        }
      : null;

    if (intelSubmission) {
      store.intelSubmissions.unshift(intelSubmission);
    }

    touchUser(sender);
    store.ogaActions.unshift({
      id: makeId("oga"),
      ogaUserId: store.users.find((user) => user.isOga)?.id ?? "unknown",
      actionType: intelSubmission ? "intel_received" : "contact_oga_received",
      targetType: intelSubmission ? "intel_submission" : "contact_message",
      targetId: intelSubmission?.id ?? message.id,
      notes: intelSubmission
        ? `${intelSubmission.urgency} / ${intelSubmission.method}`
        : message.category,
      createdAt: new Date().toISOString(),
    });

    return {
      message,
      intelSubmission,
    };
  });
}

export async function getContactOgaBundle(userId: string) {
  const store = await readStore();
  const user = getUserById(store, userId);

  if (!user) {
    throw new Error("User no dey.");
  }

  return {
    viewer: toViewer(user),
    identity: `@${user.username}`,
    accountCodeReference: user.devRecoveryCode
      ? user.devRecoveryCode.slice(-4)
      : null,
  };
}

export async function getOgaInboxBundle(selectedMessageId?: string | null) {
  const store = await readStore();
  const messages = store.contactOgaMessages
    .slice()
    .sort((left, right) => {
      if (left.status !== right.status) {
        return left.status === "unread" ? -1 : 1;
      }

      return +new Date(right.createdAt) - +new Date(left.createdAt);
    });
  const selected =
    messages.find((entry) => entry.id === selectedMessageId) ??
    messages[0] ??
    null;

  return {
    unreadCount: messages.filter((entry) => entry.status === "unread").length,
    messages,
    selected,
  };
}

export async function setContactOgaMessageStatus(params: {
  ogaId: string;
  messageId: string;
  status: "read" | "archived";
}) {
  return mutateStore((store) => {
    const message = store.contactOgaMessages.find((entry) => entry.id === params.messageId);

    if (!message) {
      throw new Error("Message no show.");
    }

    message.status = params.status;
    message.readAt =
      params.status === "read" ? new Date().toISOString() : message.readAt;
    store.ogaActions.unshift({
      id: makeId("oga"),
      ogaUserId: params.ogaId,
      actionType: `contact_message_${params.status}`,
      targetType: "contact_message",
      targetId: message.id,
      notes: message.category,
      createdAt: new Date().toISOString(),
    });
  });
}

export async function setPinnedGistPriority(params: {
  ogaId: string;
  gistId: string;
  priority: 1 | 2 | 3;
}) {
  return mutateStore((store) => {
    const gist = store.gists.find((entry) => entry.id === params.gistId);

    if (!gist || gist.status !== "active") {
      throw new Error("Only active gists fit pin.");
    }

    const existing = getPinnedGistRecord(store, params.gistId);
    const occupying = store.pinnedGists.find((entry) => entry.priority === params.priority);

    if (!existing && store.pinnedGists.length >= 3) {
      throw new Error("Three gists don already pin. Unpin one first.");
    }

    if (existing) {
      if (occupying && occupying.gistId !== existing.gistId) {
        occupying.priority = existing.priority;
        occupying.updatedAt = new Date().toISOString();
      }

      existing.priority = params.priority;
      existing.updatedAt = new Date().toISOString();
    } else {
      if (occupying) {
        const freePriority = ([1, 2, 3] as const).find(
          (value) => !store.pinnedGists.some((entry) => entry.priority === value),
        );

        if (!freePriority) {
          throw new Error("Three gists don already pin. Unpin one first.");
        }

        occupying.priority = freePriority;
        occupying.updatedAt = new Date().toISOString();
      }

      store.pinnedGists.push({
        gistId: params.gistId,
        priority: params.priority,
        pinnedByUserId: params.ogaId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    store.pinnedGists.sort((left, right) => left.priority - right.priority);
    store.ogaActions.unshift({
      id: makeId("oga"),
      ogaUserId: params.ogaId,
      actionType: "gist_pinned",
      targetType: "gist",
      targetId: params.gistId,
      notes: `priority ${params.priority}`,
      createdAt: new Date().toISOString(),
    });
  });
}

export async function unpinGist(params: {
  ogaId: string;
  gistId: string;
}) {
  return mutateStore((store) => {
    const existing = getPinnedGistRecord(store, params.gistId);

    if (!existing) {
      return;
    }

    store.pinnedGists = store.pinnedGists.filter(
      (entry) => entry.gistId !== params.gistId,
    );
    store.ogaActions.unshift({
      id: makeId("oga"),
      ogaUserId: params.ogaId,
      actionType: "gist_unpinned",
      targetType: "gist",
      targetId: params.gistId,
      notes: null,
      createdAt: new Date().toISOString(),
    });
  });
}

export async function voteInSurvey(params: {
  viewerId: string;
  surveyId: string;
  optionId: string;
}) {
  return mutateStore((store) => {
    const survey = store.surveys.find((entry) => entry.id === params.surveyId);
    const user = getUserById(store, params.viewerId);

    if (!survey || !user || getRuntimeSurveyStatus(survey) !== "live") {
      throw new Error("That Judgement Day vote no open now.");
    }

    if (!isViewerWithinSurveyScope(toViewer(user), survey)) {
      throw new Error("This Judgement Day no dey open for your side.");
    }

    const existing = store.surveyVotes.find(
      (vote) =>
        vote.surveyId === params.surveyId && vote.userId === params.viewerId,
    );

    if (existing) {
      throw new Error("You don vote already.");
    }

    const option = store.surveyOptions.find(
      (entry) => entry.id === params.optionId && entry.surveyId === survey.id,
    );

    if (!option) {
      throw new Error("Pick one option first.");
    }

    store.surveyVotes.unshift({
      id: makeId("svt"),
      surveyId: params.surveyId,
      optionId: params.optionId,
      userId: params.viewerId,
      createdAt: new Date().toISOString(),
    });
    option.votesCount += 1;
    touchUser(user);
    addPoints(store, params.viewerId, "voted-survey", survey.pointsReward, {
      surveyId: params.surveyId,
    });
    addAlert(store, {
      userId: params.viewerId,
      type: "points",
      title: "Survey vote collected",
      body: `+${survey.pointsReward} GistPoints from Judgement Day.`,
      link: "/score",
    });

    return {
      surveyId: survey.id,
      optionId: option.id,
      pointsReward: survey.pointsReward,
    };
  });
}

export async function getAlertsBundle(userId: string) {
  const store = await readStore();
  const user = getUserById(store, userId);

  if (!user) {
    throw new Error("User no dey.");
  }

  return {
    viewer: toViewer(user),
    groupedAlerts: groupAlerts(
      store.alerts
        .filter((alert) => alert.userId === userId)
        .sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt)),
    ),
  };
}

export async function getScoreBundle(userId: string) {
  const store = await readStore();
  const user = getUserById(store, userId);

  if (!user) {
    throw new Error("User no dey.");
  }

  return {
    viewer: toViewer(user),
    progress: getTierProgress(user.pointsBalance),
    history: store.userPointsLedger
      .filter((entry) => entry.userId === userId)
      .sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt)),
    leaderboardTeaser: buildLeaderboardFromLedger({
      users: store.users.filter((entry) => !entry.isOga),
      ledger: store.userPointsLedger,
      mode: "monthly",
    }).slice(0, 5),
  };
}

export async function getLeaderboardBundle(mode: "monthly" | "all-time") {
  const store = await readStore();
  return buildLeaderboardFromLedger({
    users: store.users.filter((entry) => !entry.isOga),
    ledger: store.userPointsLedger,
    mode,
  }) as LeaderboardEntry[];
}

export async function getLockerBundle(userId: string) {
  const store = await readStore();
  const user = getUserById(store, userId);

  if (!user) {
    throw new Error("User no dey.");
  }

  return {
    viewer: toViewer(user),
    trust: getTrustProfile(store, userId),
    myGists: store.gists
      .filter((gist) => gist.authorUserId === userId)
      .sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt))
      .map((gist) => buildGistCardView(store, gist, userId)),
    savedGists: store.savedGists
      .filter((entry) => entry.userId === userId)
      .sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt))
      .map((entry) => store.gists.find((gist) => gist.id === entry.gistId) ?? null)
      .filter((gist): gist is AppStore["gists"][number] => Boolean(gist))
      .map((gist) => buildGistCardView(store, gist, userId)),
    recoveryCode: user.devRecoveryCode ?? null,
  };
}

export async function getSurveyBundle(surveyId: string, viewerId: string) {
  const store = await readStore();
  const user = getUserById(store, viewerId);

  if (!user) {
    throw new Error("User no dey.");
  }

  return {
    viewer: toViewer(user),
    survey: getSurveyView(store, surveyId, viewerId),
  };
}

export async function getOgaOverviewBundle() {
  const store = await readStore();
  const activeSince = subDays(new Date(), 7);
  const liveSurvey = store.surveys.find(
    (entry) => getRuntimeSurveyStatus(entry) === "live",
  );

  const topStates = Object.entries(
    store.gists.reduce<Record<string, number>>((accumulator, gist) => {
      accumulator[gist.stateName] = (accumulator[gist.stateName] ?? 0) + 1;
      return accumulator;
    }, {}),
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5);

  const topTags = Object.entries(
    store.gists.reduce<Record<string, number>>((accumulator, gist) => {
      accumulator[gist.tag] = (accumulator[gist.tag] ?? 0) + 1;
      return accumulator;
    }, {}),
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5);

  const topAreas = Object.entries(
    store.gists.reduce<Record<string, number>>((accumulator, gist) => {
      accumulator[gist.areaDisplay] = (accumulator[gist.areaDisplay] ?? 0) + 1;
      return accumulator;
    }, {}),
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5);

  const reportBacklog = {
    total: store.gistReports.length,
    personalData: store.gistReports.filter((report) => report.type === "personal-data")
      .length,
    fakeLocation: store.gistReports.filter((report) => report.type === "fake-location")
      .length,
    general: store.gistReports.filter((report) => report.type === "general").length,
  };

  return {
    metrics: {
      totalUsers: store.users.length,
      activeNow: store.users.filter((user) => parseISO(user.lastActiveAt) > activeSince)
        .length,
      newJoins: store.users.filter((user) => parseISO(user.createdAt) > activeSince)
        .length,
      gistVolume: store.gists.length,
      commentVolume: store.gistComments.length,
      reportsOpen: reportBacklog.total,
      unreadInbox: store.contactOgaMessages.filter((entry) => entry.status === "unread")
        .length,
      pinnedGists: store.pinnedGists.length,
    },
    topStates,
    topAreas,
    topTags,
    ageMix: Object.entries(
      store.users.reduce<Record<string, number>>((accumulator, user) => {
        accumulator[user.ageRange] = (accumulator[user.ageRange] ?? 0) + 1;
        return accumulator;
      }, {}),
    ).sort((left, right) => right[1] - left[1]),
    genderMix: Object.entries(
      store.users.reduce<Record<string, number>>((accumulator, user) => {
        accumulator[user.gender] = (accumulator[user.gender] ?? 0) + 1;
        return accumulator;
      }, {}),
    ).sort((left, right) => right[1] - left[1]),
    reportBacklog,
    locationHealth: {
      knownUsers: store.users.filter((entry) => Boolean(entry.homeAreaDisplay)).length,
      lowConfidence: store.users.filter(
        (entry) => entry.locationConfidence !== null && entry.locationConfidence < 0.8,
      ).length,
      cachedLocations: store.locationCache.length,
    },
    liveSurvey: liveSurvey ? getSurveyView(store, liveSurvey.id, null) : null,
  };
}

export async function getOgaMataBundle() {
  const store = await readStore();
  const byArea = Object.entries(
    store.gists.reduce<Record<string, number>>((accumulator, gist) => {
      accumulator[gist.areaDisplay] = (accumulator[gist.areaDisplay] ?? 0) + 1;
      return accumulator;
    }, {}),
  ).sort((left, right) => right[1] - left[1]);

  return {
    activityByFeedLevel: [
      { label: "My Street", count: byArea[0]?.[1] ?? 0 },
      { label: "My Area", count: byArea[1]?.[1] ?? 0 },
      { label: "State", count: store.gists.length },
      { label: "Nigeria", count: store.gists.length },
      { label: "Hot", count: store.gists.filter((gist) => gist.reactionsCount > 0).length },
    ],
    hotAreas: byArea.slice(0, 5),
    quietAreas: byArea.slice(-5).reverse(),
    surgingTags: Object.entries(
      store.gists.reduce<Record<string, number>>((accumulator, gist) => {
        accumulator[gist.tag] = (accumulator[gist.tag] ?? 0) + 1;
        return accumulator;
      }, {}),
    )
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5),
  };
}

export async function getOgaGistsBundle() {
  const store = await readStore();
  return store.gists
    .slice()
    .sort((left, right) => {
      const leftPinned = getPinnedGistRecord(store, left.id)?.priority ?? 99;
      const rightPinned = getPinnedGistRecord(store, right.id)?.priority ?? 99;

      if (leftPinned !== rightPinned) {
        return leftPinned - rightPinned;
      }

      return +new Date(right.createdAt) - +new Date(left.createdAt);
    })
    .map((gist) => ({
      ...buildGistCardView(store, gist, null, "nigeria"),
      stateName: gist.stateName,
      status: gist.status,
    }));
}

export async function setGistStatus(params: {
  ogaId: string;
  gistId: string;
  status: "active" | "removed";
}) {
  return mutateStore((store) => {
    const gist = store.gists.find((entry) => entry.id === params.gistId);

    if (!gist) {
      throw new Error("Gist no show.");
    }

    gist.status = params.status;
    const resolutionTime = new Date().toISOString();

    for (const report of store.gistReports.filter(
      (entry) =>
        entry.gistId === params.gistId &&
        entry.status !== "resolved" &&
        entry.status !== "invalid",
    )) {
      report.status = params.status === "removed" ? "resolved" : "triaged";
      report.triagedAt = report.triagedAt ?? resolutionTime;
      report.resolvedAt = params.status === "removed" ? resolutionTime : null;
      report.resolvedByOgaUserId = params.ogaId;
      report.resolutionNotes =
        params.status === "removed"
          ? "Resolved by oga removal action."
          : "Triaged during gist restoration review.";
    }

    store.ogaActions.unshift({
      id: makeId("oga"),
      ogaUserId: params.ogaId,
      actionType: params.status === "removed" ? "gist_removed" : "gist_restored",
      targetType: "gist",
      targetId: gist.id,
      notes: null,
      createdAt: new Date().toISOString(),
    });
  });
}

export async function getOgaTrustBundle() {
  const store = await readStore();
  const items = store.gistReports
    .slice()
    .sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt))
    .map((report) => {
      const gist = store.gists.find((entry) => entry.id === report.gistId);
      const author = gist ? getUserById(store, gist.authorUserId) : null;
      const trust = author ? getTrustProfile(store, author.id) : null;

      return {
        report,
        gist: gist ? buildGistCardView(store, gist, null, "nigeria") : null,
        author,
        trust,
        moderationStatus: author ? buildModerationStatus(author, trust) : "Unknown",
      };
    });

  return {
    summary: {
      total: items.length,
      personalData: items.filter((entry) => entry.report.type === "personal-data").length,
      fakeLocation: items.filter((entry) => entry.report.type === "fake-location").length,
      general: items.filter((entry) => entry.report.type === "general").length,
      comotCandidates: items.filter(
        (entry) => entry.moderationStatus === "Comot Tag candidate",
      ).length,
    },
    items,
  };
}

export async function getOgaUsersBundle() {
  const store = await readStore();
  return store.users
    .slice()
    .sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt))
    .map((user) => ({
      id: user.id,
      username: user.username,
      tier: user.tier,
      pointsBalance: user.pointsBalance,
      state: user.homeState,
      ageRange: user.ageRange,
      gender: user.gender,
      comotTagged: user.comotTagged,
      referredByUserId: user.referredByUserId,
      referredByUsername: user.referredByUserId
        ? getUserById(store, user.referredByUserId)?.username ?? null
        : null,
      referralCodeUsed: user.referralCodeUsed,
      joinedAt: user.createdAt,
      lastActiveAt: user.lastActiveAt,
      trust: getTrustProfile(store, user.id),
      moderationStatus: buildModerationStatus(user, getTrustProfile(store, user.id)),
    }));
}

export async function getOgaGrowthBundle() {
  const store = await readStore();
  const nonOgaUsers = store.users.filter((user) => !user.isOga);
  const usedCodes = store.referralCodes.filter((code) => code.usedByUserId);
  const activeCodes = store.referralCodes.filter((code) => code.isActive);

  return {
    activeCodes,
    usedCodes: usedCodes.map((code) => ({
      ...code,
      createdByUsername: getUserById(store, code.createdByUserId)?.username ?? "unknown",
      usedByUsername: code.usedByUserId
        ? getUserById(store, code.usedByUserId)?.username ?? "unknown"
        : null,
    })),
    activationMetrics: {
      totalCodes: store.referralCodes.length,
      usedCodes: usedCodes.length,
      activatedUsers: nonOgaUsers.length,
      usageRate:
        store.referralCodes.length === 0
          ? 0
          : usedCodes.length / store.referralCodes.length,
    },
    retentionSnapshot: {
      last7Days: nonOgaUsers.filter(
        (user) => parseISO(user.lastActiveAt) > subDays(new Date(), 7),
      ).length,
      last30Days: nonOgaUsers.filter(
        (user) => parseISO(user.lastActiveAt) > subDays(new Date(), 30),
      ).length,
    },
    expiringSoon: activeCodes.filter(
      (code) => code.expiresAt && parseISO(code.expiresAt) < subDays(new Date(), -7),
    ),
    referralLineage: nonOgaUsers
      .filter((user) => user.referredByUserId)
      .map((user) => ({
        username: user.username,
        referredByUsername:
          getUserById(store, user.referredByUserId!)?.username ?? "unknown",
        state: user.homeState,
        joinedAt: user.createdAt,
        referralCodeUsed: user.referralCodeUsed,
      }))
      .sort((left, right) => +new Date(right.joinedAt) - +new Date(left.joinedAt))
      .slice(0, 8),
  };
}

export async function generateReferralCodes(ogaId: string, count: number) {
  return mutateStore((store) => {
    const codes = Array.from({ length: count }, () => ({
      id: makeId("ref"),
      code: createReferralCode(),
      createdByUserId: ogaId,
      usedByUserId: null,
      usedAt: null,
      expiresAt: daysFromNow(30),
      isActive: true,
    }));

    store.referralCodes.unshift(...codes);
    store.ogaActions.unshift({
      id: makeId("oga"),
      ogaUserId: ogaId,
      actionType: "referrals_generated",
      targetType: "referral_batch",
      targetId: codes[0].id,
      notes: `${count} codes`,
      createdAt: new Date().toISOString(),
    });

    return codes;
  });
}

export async function getOgaBroadcastBundle() {
  const store = await readStore();
  return {
    recentAlerts: store.alerts.slice(0, 12),
  };
}

export async function sendBroadcast(params: {
  ogaId: string;
  audience: "all" | "inactive" | "state";
  stateName?: string;
  title: string;
  body: string;
  link?: string;
}) {
  return mutateStore((store) => {
    let recipients = store.users.filter((user) => !user.isOga);

    if (params.audience === "inactive") {
      recipients = recipients.filter(
        (user) => parseISO(user.lastActiveAt) < subDays(new Date(), 7),
      );
    }

    if (params.audience === "state" && params.stateName) {
      recipients = recipients.filter((user) => user.homeState === params.stateName);
    }

    for (const recipient of recipients) {
      addAlert(store, {
        userId: recipient.id,
        type: "account",
        title: params.title,
        body: params.body,
        link: params.link || "/alerts",
      });
    }

    store.ogaActions.unshift({
      id: makeId("oga"),
      ogaUserId: params.ogaId,
      actionType: "broadcast_sent",
      targetType: "alert",
      targetId: makeId("aud"),
      notes: `${params.audience} -> ${recipients.length} users`,
      createdAt: new Date().toISOString(),
    });
  });
}

export async function getOgaLocationBundle() {
  const store = await readStore();
  return {
    resolutionHealth: {
      knownUsers: store.users.filter((user) => user.homeAreaDisplay).length,
      unknownUsers: store.users.filter((user) => !user.homeAreaDisplay).length,
      cachedLocations: store.locationCache.length,
    },
    providerMix: buildTopCounts(store.locationCache.map((location) => location.provider), 5),
    cachedLocations: store.locationCache,
    lowConfidenceUsers: store.users.filter(
      (user) => user.locationConfidence !== null && user.locationConfidence < 0.8,
    ),
  };
}

export async function getOgaSettingsBundle() {
  const store = await readStore();
  return {
    flags: store.featureFlags,
    auditTrail: store.ogaActions
      .slice()
      .sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt))
      .slice(0, 20),
  };
}

export async function createSurvey(params: {
  ogaId: string;
  question: string;
  scopeType: "nigeria" | "state" | "area";
  scopeValue?: string;
  endsAt: string;
  options: [string, string, string];
}) {
  return mutateStore((store) => {
    const surveyId = makeId("srv");
    store.surveys.forEach((survey) => {
      if (survey.pinned) {
        survey.pinned = false;
      }
    });

    store.surveys.unshift({
      id: surveyId,
      question: params.question,
      createdByUserId: params.ogaId,
      scopeType: params.scopeType,
      scopeValue: params.scopeValue?.trim() || null,
      status: "live",
      pinned: true,
      startsAt: new Date().toISOString(),
      endsAt: new Date(params.endsAt).toISOString(),
      createdAt: new Date().toISOString(),
      pointsReward: 12,
    });

    params.options.forEach((option) => {
      store.surveyOptions.push({
        id: makeId("opt"),
        surveyId,
        label: option,
        votesCount: 0,
      });
    });

    store.ogaActions.unshift({
      id: makeId("oga"),
      ogaUserId: params.ogaId,
      actionType: "survey_created",
      targetType: "survey",
      targetId: surveyId,
      notes: params.scopeType,
      createdAt: new Date().toISOString(),
    });

    const createdSurvey = store.surveys[0]!;

    for (const user of store.users.filter(
      (entry) => !entry.isOga && isViewerWithinSurveyScope(toViewer(entry), createdSurvey),
    )) {
      addAlert(store, {
        userId: user.id,
        type: "survey",
        title: "Judgement Day don drop",
        body: params.question,
        link: `/judgement-day/${surveyId}`,
      });
    }
  });
}

export async function setSurveyPinned(params: {
  ogaId: string;
  surveyId: string;
  pinned: boolean;
}) {
  return mutateStore((store) => {
    const survey = store.surveys.find((entry) => entry.id === params.surveyId);

    if (!survey) {
      throw new Error("Survey no show.");
    }

    if (params.pinned) {
      store.surveys.forEach((entry) => {
        entry.pinned = false;
      });
    }

    survey.pinned = params.pinned;
    store.ogaActions.unshift({
      id: makeId("oga"),
      ogaUserId: params.ogaId,
      actionType: params.pinned ? "survey_pinned" : "survey_unpinned",
      targetType: "survey",
      targetId: survey.id,
      notes: null,
      createdAt: new Date().toISOString(),
    });
  });
}

export async function setSurveyStatus(params: {
  ogaId: string;
  surveyId: string;
  status: "draft" | "live" | "closed";
}) {
  return mutateStore((store) => {
    const survey = store.surveys.find((entry) => entry.id === params.surveyId);

    if (!survey) {
      throw new Error("Survey no show.");
    }

    survey.status = params.status;
    if (params.status !== "live") {
      survey.pinned = false;
    }

    store.ogaActions.unshift({
      id: makeId("oga"),
      ogaUserId: params.ogaId,
      actionType: `survey_${params.status}`,
      targetType: "survey",
      targetId: survey.id,
      notes: null,
      createdAt: new Date().toISOString(),
    });
  });
}
