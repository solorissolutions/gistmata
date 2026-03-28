import type {
  ContactOgaCategory,
  FeedLevel,
  GistRelationType,
  GistTag,
  IntelMethod,
  IntelUrgency,
  LocationSnapshot,
  UserTier,
  Viewer,
} from "@/lib/domain/types";

export type FeedSort = "smart" | "recent";

export interface FeedBundleFilters {
  tag?: string;
  sort?: FeedSort;
}

export interface FeedBundleRequest extends FeedBundleFilters {
  level: FeedLevel;
  viewer: Viewer;
}

export interface GistDraftInput {
  body: string;
  tag: GistTag;
  location: LocationSnapshot;
}

export interface FollowUpGistDraftInput extends GistDraftInput {
  parentGistId: string;
  relationType: GistRelationType;
}

export interface ContactOgaMessageInput {
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
}

export interface BroadcastCreationInput {
  audience: "all" | "inactive" | "state";
  stateName?: string;
  title: string;
  body: string;
  link?: string;
}

export interface OgaMatterFilters {
  q?: string;
  tag?: string;
  state?: string;
  status?: string;
  matterId?: string;
}

export interface OgaInboxFilters {
  status?: string;
  messageId?: string;
}

export interface ScoreLeaderboardRequest {
  mode: "monthly" | "all-time";
}

export interface TierBenefitsBundle {
  tier: UserTier;
  current: string[];
  future: string[];
  nextUnlockLabel: string;
}
