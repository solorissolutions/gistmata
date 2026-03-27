export type FeedLevel =
  | "my-street"
  | "my-area"
  | "state"
  | "nigeria"
  | "hot";

export type GistTag =
  | "General"
  | "NEPA"
  | "Fuel"
  | "Govt"
  | "Safety"
  | "Market"
  | "Road"
  | "Japa"
  | "Jobs"
  | "Landlord"
  | "Church"
  | "Entertainment"
  | "Adult";

export type GenderValue = "Male" | "Female" | "Prefer not to say";

export type AgeRangeValue = "18-24" | "25-34" | "35-44" | "45+";

export type UserTier =
  | "New Member"
  | "Area Voice"
  | "Street OG"
  | "Area Legend";

export type ReactionType = "wahala" | "omo" | "sharp";

export type ReportType = "general" | "personal-data" | "fake-location";
export type ReportLifecycleStatus = "open" | "triaged" | "resolved" | "invalid";

export type GistStatus = "active" | "removed";

export type GistRelationType =
  | "follow-up"
  | "update"
  | "confirm"
  | "counter"
  | "same-for-my-side";

export type CommentStatus = "active" | "removed";

export type SurveyStatus = "draft" | "live" | "closed";

export type SurveyScopeType = "nigeria" | "state" | "area";

export type AlertType =
  | "comment"
  | "activity"
  | "survey"
  | "points"
  | "account";

export type AlertGroup =
  | "Comments"
  | "Mata activity"
  | "Judgement Day"
  | "Points"
  | "Account / inactivity";

export type GistPointsEvent =
  | "join"
  | "drop-gist"
  | "received-reaction"
  | "received-comment"
  | "voted-survey"
  | "milestone"
  | "report-validated";

export type FeatureFlagKey =
  | "predictions"
  | "promoted_gist"
  | "dark_mode"
  | "translation_visibility"
  | "advanced_moderation_provider";

export type ContactOgaCategory =
  | "General"
  | "Report issue"
  | "Recovery help"
  | "Suggestion"
  | "Intel";

export type ContactOgaMessageStatus = "unread" | "read" | "archived";

export type IntelMethod =
  | "direct-witness"
  | "trusted-source"
  | "pattern-observed"
  | "existing-gist";

export type IntelUrgency = "routine" | "watch" | "urgent";

export type IntelSubmissionStatus = "new" | "reviewing" | "logged";

export type PredictionModuleStatus = "draft" | "live" | "closed";

export interface LocationSnapshot {
  displayLocality: string;
  areaBucket: string;
  admin2Name: string;
  admin2Type: string;
  stateName: string;
  confidenceScore: number;
}

export interface UserRecord {
  id: string;
  username: string;
  usernameNormalized: string;
  pinHash: string;
  accountCodeHash: string;
  homeState: string;
  ageRange: AgeRangeValue;
  gender: GenderValue;
  tier: UserTier;
  pointsBalance: number;
  isOga: boolean;
  comotTagged: boolean;
  createdAt: string;
  lastActiveAt: string;
  homeAreaDisplay: string | null;
  homeAreaBucket: string | null;
  homeAdmin2Name: string | null;
  homeAdmin2Type: string | null;
  locationConfidence: number | null;
  referredByUserId: string | null;
  referralCodeUsed: string | null;
  devRecoveryCode?: string | null;
}

export interface SessionRecord {
  id: string;
  userId: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
  lastSeenAt: string;
}

export interface JoinDraftRecord {
  id: string;
  referralCodeId: string;
  referralCode: string;
  username: string | null;
  usernameNormalized: string | null;
  pinHash: string | null;
  accountCode: string | null;
  accountCodeHash: string | null;
  state: string | null;
  ageRange: AgeRangeValue | null;
  gender: GenderValue | null;
  createdAt: string;
}

export interface ReferralCodeRecord {
  id: string;
  code: string;
  createdByUserId: string;
  usedByUserId: string | null;
  usedAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
}

export interface GistRecord {
  id: string;
  authorUserId: string;
  body: string;
  tag: GistTag;
  areaDisplay: string;
  areaBucket: string;
  admin2Name: string;
  admin2Type: string;
  stateName: string;
  feedVisibilityScore: number;
  translationText: string | null;
  commentsCount: number;
  reactionsCount: number;
  reportsCount: number;
  followUpCount: number;
  status: GistStatus;
  createdAt: string;
}

export interface GistReactionRecord {
  id: string;
  gistId: string;
  userId: string;
  type: ReactionType;
  createdAt: string;
}

export interface GistCommentRecord {
  id: string;
  gistId: string;
  authorUserId: string;
  body: string;
  status: CommentStatus;
  createdAt: string;
  parentCommentId: string | null;
}

export interface GistReportRecord {
  id: string;
  gistId: string;
  reporterUserId: string;
  type: ReportType;
  reasonText: string | null;
  status?: ReportLifecycleStatus;
  triagedAt?: string | null;
  resolvedAt?: string | null;
  resolvedByOgaUserId?: string | null;
  resolutionNotes?: string | null;
  createdAt: string;
}

export interface SurveyRecord {
  id: string;
  question: string;
  createdByUserId: string;
  scopeType: SurveyScopeType;
  scopeValue: string | null;
  status: SurveyStatus;
  pinned: boolean;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  pointsReward: number;
}

export interface SurveyOptionRecord {
  id: string;
  surveyId: string;
  label: string;
  votesCount: number;
}

export interface SurveyVoteRecord {
  id: string;
  surveyId: string;
  optionId: string;
  userId: string;
  createdAt: string;
}

export interface AlertRecord {
  id: string;
  userId: string;
  type: AlertType;
  title: string;
  body: string;
  link: string;
  readAt: string | null;
  createdAt: string;
}

export interface SavedGistRecord {
  id: string;
  userId: string;
  gistId: string;
  createdAt: string;
}

export interface ContactOgaMessageRecord {
  id: string;
  senderUserId: string | null;
  senderIdentity: string;
  accountCodeReference: string | null;
  category: ContactOgaCategory | null;
  body: string;
  status: ContactOgaMessageStatus;
  createdAt: string;
  readAt: string | null;
}

export interface IntelSubmissionRecord {
  id: string;
  contactMessageId: string;
  senderUserId: string | null;
  senderIdentity: string;
  accountCodeReference: string | null;
  method: IntelMethod;
  urgency: IntelUrgency;
  summary: string;
  body: string;
  locationHint: string | null;
  linkedGistReference: string | null;
  status: IntelSubmissionStatus;
  createdAt: string;
  reviewedAt: string | null;
}

export interface PinnedGistRecord {
  gistId: string;
  priority: 1 | 2 | 3;
  pinnedByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PredictionModuleRecord {
  id: string;
  title: string;
  body: string;
  kicker: string;
  status: PredictionModuleStatus;
  createdByUserId: string;
  createdAt: string;
}

export interface UserPointsLedgerRecord {
  id: string;
  userId: string;
  eventType: GistPointsEvent;
  pointsDelta: number;
  metadata: Record<string, string | number | boolean | null>;
  createdAt: string;
}

export interface UserTrustProfileRecord {
  userId: string;
  trustScore: number;
  personalDataStrikes: number;
  fakeLocationStrikes: number;
  validReportCount: number;
  invalidReportCount: number;
  lastUpdatedAt: string;
}

export interface OgaActionRecord {
  id: string;
  ogaUserId: string;
  actionType: string;
  targetType: string;
  targetId: string;
  notes: string | null;
  createdAt: string;
}

export interface LocationCacheRecord extends LocationSnapshot {
  id: string;
  provider: string;
  providerRef: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlagRecord {
  key: FeatureFlagKey;
  enabled: boolean;
  description: string;
}

/**
 * Links a follow-up Gist to its parent Gist/matter.
 * A follow-up Gist is a full new Gist — this record stores the relation.
 */
export interface GistRelationRecord {
  id: string;
  childGistId: string;
  parentGistId: string;
  relationType: GistRelationType;
  createdAt: string;
}

export interface AppStore {
  users: UserRecord[];
  sessions: SessionRecord[];
  joinDrafts: JoinDraftRecord[];
  referralCodes: ReferralCodeRecord[];
  accountRecoveryEvents: Array<{
    id: string;
    userId: string;
    success: boolean;
    createdAt: string;
  }>;
  gists: GistRecord[];
  gistRelations: GistRelationRecord[];
  gistReactions: GistReactionRecord[];
  gistComments: GistCommentRecord[];
  gistReports: GistReportRecord[];
  surveys: SurveyRecord[];
  surveyOptions: SurveyOptionRecord[];
  surveyVotes: SurveyVoteRecord[];
  alerts: AlertRecord[];
  savedGists: SavedGistRecord[];
  contactOgaMessages: ContactOgaMessageRecord[];
  intelSubmissions: IntelSubmissionRecord[];
  pinnedGists: PinnedGistRecord[];
  predictionModules: PredictionModuleRecord[];
  userPointsLedger: UserPointsLedgerRecord[];
  userTrustProfiles: UserTrustProfileRecord[];
  ogaActions: OgaActionRecord[];
  locationCache: LocationCacheRecord[];
  featureFlags: FeatureFlagRecord[];
}

export interface Viewer {
  id: string;
  username: string;
  tier: UserTier;
  pointsBalance: number;
  homeState: string;
  isOga: boolean;
  comotTagged: boolean;
  location: LocationSnapshot | null;
}

export interface GistCardView {
  id: string;
  username: string;
  authorTier: UserTier;
  locationLabel: string;
  areaLabel: string;
  broaderAreaLabel: string;
  stateLabel: string;
  reachLabel: string;
  viewerLevel: FeedLevel;
  tag: GistTag;
  body: string;
  translationText: string | null;
  commentsCount: number;
  followUpCount: number;
  reportsCount: number;
  createdAt: string;
  reactionTotals: Record<ReactionType, number>;
  viewerReaction: ReactionType | null;
  isSaved: boolean;
  pinnedByOgaPriority: 1 | 2 | 3 | null;
  status: GistStatus;
  /** Set when this Gist is itself a follow-up to another Gist */
  parentGistId: string | null;
  parentRelationType: GistRelationType | null;
}

export interface CommentView {
  id: string;
  username: string;
  body: string;
  createdAt: string;
  isAuthor: boolean;
}

export interface SurveyView {
  id: string;
  question: string;
  scopeLabel: string;
  status: SurveyStatus;
  pinned: boolean;
  startsAt: string;
  endsAt: string;
  hasVoted: boolean;
  viewerOptionId: string | null;
  options: Array<{
    id: string;
    label: string;
    votesCount: number;
    percentage: number;
  }>;
  totalVotes: number;
  pointsReward: number;
}

export interface PredictionModuleView {
  id: string;
  title: string;
  body: string;
  kicker: string;
  status: PredictionModuleStatus;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  tier: UserTier;
  state: string;
  points: number;
  rank: number;
}

export interface TierDefinition {
  tier: UserTier;
  minPoints: number;
  description: string;
}

export interface AlertGroupView {
  title: AlertGroup;
  alerts: AlertRecord[];
}
