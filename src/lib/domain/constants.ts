import type {
  AgeRangeValue,
  AlertGroup,
  ContactOgaCategory,
  FeedLevel,
  FeatureFlagKey,
  GenderValue,
  GistRelationType,
  GistTag,
  IntelMethod,
  IntelUrgency,
  ReactionType,
  ReportType,
  TierDefinition,
  UserTier,
} from "@/lib/domain/types";

export const APP_NAME = "GistMata";
export const APP_TAGLINE = "na una get the mata";

export const SESSION_COOKIE_NAME = "gm_session";
export const JOIN_DRAFT_COOKIE_NAME = "gm_join";

export const MAX_GIST_LENGTH = 350;
export const MAX_COMMENT_LENGTH = 180;
export const MAX_COMMENTS_PER_GIST_PER_USER = 3;
export const MAX_GISTS_PER_DAY = 5;

export const PERSONAL_DATA_BLOCK_MESSAGE =
  "Your gist get personal info wey we no fit allow. Remove am and repost.";

export const FEED_LEVELS: Array<{
  value: FeedLevel;
  label: string;
  shortLabel: string;
}> = [
  { value: "my-street", label: "My Street", shortLabel: "Street" },
  { value: "my-area", label: "My Area", shortLabel: "Area" },
  { value: "state", label: "State", shortLabel: "State" },
  { value: "nigeria", label: "Nigeria", shortLabel: "Nigeria" },
  { value: "hot", label: "Hot", shortLabel: "Hot" },
];

export const GIST_TAGS: GistTag[] = [
  "General",
  "NEPA",
  "Fuel",
  "Govt",
  "Safety",
  "Market",
  "Road",
  "Japa",
  "Jobs",
  "Landlord",
  "Church",
  "Entertainment",
  "Adult",
];

export const TOPIC_FILTERS = ["All", ...GIST_TAGS] as const;

export const RELATION_TYPE_LABELS: Record<GistRelationType, string> = {
  "follow-up": "Joined mouth on this",
  "update": "Update on this matter",
  "confirm": "Confirmed this",
  "counter": "Counter gist",
  "same-for-my-side": "Same for my side",
};

export const RELATION_TYPE_OPTIONS: Array<{ value: GistRelationType; label: string }> = [
  { value: "follow-up", label: "Join mouth (general follow-up)" },
  { value: "update", label: "Update — new development" },
  { value: "confirm", label: "Confirm — I can corroborate" },
  { value: "counter", label: "Counter — my side different" },
  { value: "same-for-my-side", label: "Same for my side" },
];

export const AGE_RANGES: AgeRangeValue[] = ["18-24", "25-34", "35-44", "45+"];

export const GENDERS: GenderValue[] = [
  "Male",
  "Female",
  "Prefer not to say",
];

export const REACTION_OPTIONS: Array<{
  value: ReactionType;
  label: string;
}> = [
  { value: "wahala", label: "Wahala" },
  { value: "omo", label: "Omo!" },
  { value: "sharp", label: "Sharp" },
];

export const REPORT_TYPE_OPTIONS: Array<{
  value: ReportType;
  label: string;
}> = [
  { value: "general", label: "General report" },
  { value: "personal-data", label: "Personal Data" },
  { value: "fake-location", label: "Fake Location" },
];

export const ALERT_GROUP_LABELS: Record<string, AlertGroup> = {
  comment: "Comments",
  activity: "Mata activity",
  points: "Points",
  account: "Account / inactivity",
};

export const TIER_DEFINITIONS: TierDefinition[] = [
  {
    tier: "New Member",
    minPoints: 0,
    description: "You don enter Mata. Observe, gist small, build trust.",
  },
  {
    tier: "Area Voice",
    minPoints: 120,
    description: "People for your area don dey hear your gist well.",
  },
  {
    tier: "Street OG",
    minPoints: 350,
    description: "Your gist don get weight for street-level Mata.",
  },
  {
    tier: "Area Legend",
    minPoints: 700,
    description: "You don become steady voice across your area.",
  },
];

export const FEATURE_FLAGS: Array<{
  key: FeatureFlagKey;
  enabled: boolean;
  description: string;
}> = [
  {
    key: "dark_mode",
    enabled: false,
    description: "Future dark palette support.",
  },
  {
    key: "translation_visibility",
    enabled: true,
    description: "Show translation toggle on selected gists.",
  },
  {
    key: "advanced_moderation_provider",
    enabled: false,
    description: "Hook for a smarter moderation service later.",
  },
];

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

export const RESERVED_USERNAMES = ["oga"];

export const NAV_ITEMS = [
  { href: "/mata", label: "Mata" },
  { href: "/alerts", label: "Alerts" },
  { href: "/score", label: "Score" },
  { href: "/locker", label: "Locker" },
];

export const JOIN_STEPS = [
  { href: "/join", label: "Referral", help: "Who give you code?" },
  { href: "/join/username", label: "Username", help: "Pick am once." },
  { href: "/join/pin", label: "PIN", help: "6 digits only." },
  { href: "/join/account-code", label: "Account Code", help: "Screenshot this now." },
  { href: "/join/basics", label: "Basics", help: "State, age range, gender." },
  { href: "/join/rules", label: "One rule", help: "No full names, numbers, addresses." },
] as const;

export const FEED_SORT_OPTIONS = [
  { value: "smart", label: "Pulse" },
  { value: "recent", label: "Fresh" },
] as const;

export function getFeedLevelLabel(value: FeedLevel) {
  return FEED_LEVELS.find((level) => level.value === value)?.label ?? "Mata";
}

export function getTierByPoints(points: number): UserTier {
  const match = [...TIER_DEFINITIONS]
    .reverse()
    .find((definition) => points >= definition.minPoints);

  return match?.tier ?? "New Member";
}

export function getNextTier(points: number) {
  return TIER_DEFINITIONS.find((definition) => definition.minPoints > points);
}

export const CONTACT_OGA_CATEGORIES = [
  "General",
  "Report issue",
  "Recovery help",
  "Suggestion",
  "Intel",
 ] as const satisfies readonly ContactOgaCategory[];

export const INTEL_METHODS = [
  "direct-witness",
  "trusted-source",
  "pattern-observed",
  "existing-gist",
 ] as const satisfies readonly IntelMethod[];

export const INTEL_METHOD_OPTIONS: Array<{ value: IntelMethod; label: string }> = [
  { value: "direct-witness", label: "I saw or heard this myself" },
  { value: "trusted-source", label: "A trusted person told me" },
  { value: "pattern-observed", label: "I noticed a repeated pattern" },
  { value: "existing-gist", label: "This extends an existing Gist" },
];

export const INTEL_URGENCY_LEVELS = [
  "routine",
  "watch",
  "urgent",
 ] as const satisfies readonly IntelUrgency[];

export const INTEL_URGENCY_OPTIONS: Array<{ value: IntelUrgency; label: string }> = [
  { value: "routine", label: "Routine intel" },
  { value: "watch", label: "Watch this matter" },
  { value: "urgent", label: "Urgent signal" },
];

export const CONTACT_OGA_EMAIL = "oga@gistmata.com";

export const TIER_BENEFITS: Record<
  UserTier,
  {
    current: string[];
    future: string[];
    nextUnlockLabel: string;
  }
> = {
  "New Member": {
    current: [
      "Post gists, join mouth, react, save, and report without exposing identity.",
      "Use the five referral codes attached to your account.",
    ],
    future: [
      "Higher tiers bring stronger score presence and wider community weight.",
      "Operator trust signals respond faster to steady clean contribution.",
    ],
    nextUnlockLabel: "Area Voice adds stronger visibility in Mata and score.",
  },
  "Area Voice": {
    current: [
      "Steadier standing in Mata and clearer score momentum.",
      "Your clean gist pattern starts to carry more social weight.",
    ],
    future: [
      "Street OG brings stronger trust standing and platform credibility.",
      "Area Legend sharpens your visibility across the wider board.",
    ],
    nextUnlockLabel: "Street OG adds stronger trust standing in the board.",
  },
  "Street OG": {
    current: [
      "Trusted status inside the platform.",
      "Stronger leaderboard presence and steady community weight.",
    ],
    future: [
      "Area Legend pushes your signal higher across Mata surfaces.",
      "Referral success and clean contribution deepen your platform influence.",
    ],
    nextUnlockLabel: "Area Legend brings stronger visibility across the board.",
  },
  "Area Legend": {
    current: [
      "Top-tier leaderboard prestige and stronger visibility signals.",
      "Your Gists stay easier for the wider Mata to notice.",
    ],
    future: [
      "You already hold the highest public standing in the current product.",
      "Future unlocks stay roadmap-only until a new feature is truly live.",
    ],
    nextUnlockLabel: "Top tier reached.",
  },
};

export const EXTRA_ALLOWANCE_RULE =
  "Every 10,000 points adds 1 extra post/comment allowance.";
