import { z } from "zod";

import {
  AGE_RANGES,
  CONTACT_OGA_CATEGORIES,
  GIST_TAGS,
  INTEL_METHODS,
  INTEL_URGENCY_LEVELS,
  MAX_COMMENT_LENGTH,
  MAX_GIST_LENGTH,
  NIGERIAN_STATES,
  REPORT_TYPE_OPTIONS,
  RESERVED_USERNAMES,
} from "@/lib/domain/constants";

const stateSchema = z.enum(NIGERIAN_STATES);
const ageRangeSchema = z.enum(AGE_RANGES);
const genderSchema = z.enum(["Male", "Female", "Prefer not to say"]);
const tagSchema = z.enum(GIST_TAGS);
const reportTypeSchema = z.enum(
  REPORT_TYPE_OPTIONS.map((option) => option.value) as [
    "general",
    "personal-data",
    "fake-location",
  ],
);

export const referralCodeSchema = z.object({
  code: z.string().trim().min(4, "Enter a valid referral code."),
});

export const usernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Pick at least 3 characters.")
    .max(18, "Keep am under 18 characters.")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Use only letters, numbers, or underscore.",
    )
    .refine(
      (value) => !RESERVED_USERNAMES.includes(value.toLowerCase()),
      "That username no dey available.",
    ),
});

export const pinSchema = z.object({
  pin: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "PIN must be exactly 6 digits."),
});

export const basicsSchema = z.object({
  state: stateSchema,
  ageRange: ageRangeSchema,
  gender: genderSchema,
});

export const recoverySchema = z.object({
  accountCode: z.string().trim().min(6, "Enter your Account Code."),
  pin: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "PIN must be exactly 6 digits."),
});

export const loginSchema = z.object({
  username: z.string().trim().min(3, "Enter your username."),
  pin: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "PIN must be exactly 6 digits."),
});

export const gistSchema = z.object({
  body: z
    .string()
    .trim()
    .min(4, "Tell Mata wetin happen first.")
    .max(MAX_GIST_LENGTH, `Keep am within ${MAX_GIST_LENGTH} characters.`),
  tag: tagSchema,
});

export const followUpGistSchema = z.object({
  body: z
    .string()
    .trim()
    .min(4, "Tell Mata wetin happen first.")
    .max(MAX_GIST_LENGTH, `Keep am within ${MAX_GIST_LENGTH} characters.`),
  tag: tagSchema,
  relationType: z.enum([
    "follow-up",
    "update",
    "confirm",
    "counter",
    "same-for-my-side",
  ]),
  parentGistId: z.string().trim().min(3, "Parent gist no clear."),
});

export const commentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(2, "Drop small reply first.")
    .max(MAX_COMMENT_LENGTH, `Keep comment under ${MAX_COMMENT_LENGTH}.`),
});

export const reportSchema = z.object({
  type: reportTypeSchema,
  reasonText: z.string().trim().max(180).optional(),
  gistId: z.string().trim().min(3),
});

export const referralGenerateSchema = z.object({
  count: z.coerce.number().int().min(1).max(10),
});

export const broadcastSchema = z.object({
  audience: z.enum(["all", "inactive", "state"]),
  stateName: z.string().trim().max(40).optional(),
  title: z.string().trim().min(4).max(70),
  body: z.string().trim().min(8).max(180),
  link: z.string().trim().max(120).optional(),
});

export const contactOgaSchema = z.object({
  accountCodeReference: z.string().trim().max(40).optional(),
  category: z.enum(CONTACT_OGA_CATEGORIES).default("General"),
  body: z.string().trim().min(8, "Tell oga the matter first.").max(600),
  intelMethod: z.enum(INTEL_METHODS).optional(),
  intelUrgency: z.enum(INTEL_URGENCY_LEVELS).optional(),
  intelSummary: z.string().trim().max(120).optional(),
  intelLocationHint: z.string().trim().max(120).optional(),
  intelLinkedGistReference: z.string().trim().max(120).optional(),
}).superRefine((value, context) => {
  if (value.category !== "Intel") {
    return;
  }

  if (!value.intelMethod) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["intelMethod"],
      message: "Tell oga how you got this intel.",
    });
  }

  if (!value.intelUrgency) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["intelUrgency"],
      message: "Set the urgency for this intel.",
    });
  }

  if (!value.intelSummary || value.intelSummary.length < 6) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["intelSummary"],
      message: "Summarise the intel in one short line.",
    });
  }
});

export type ActionState = {
  status: "idle" | "error" | "success" | "warning";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const INITIAL_ACTION_STATE: ActionState = { status: "idle" };
