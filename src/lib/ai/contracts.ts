import { z } from "zod";

import { GIST_TAGS, MAX_GIST_LENGTH } from "@/lib/domain/constants";

export const RELATION_TYPE_VALUES = [
  "follow-up",
  "update",
  "confirm",
  "counter",
  "same-for-my-side",
] as const;

export const DRAFT_CONTEXT_VALUES = ["new-gist", "follow-up"] as const;
export const DRAFT_SAFETY_SEVERITIES = ["allow", "warn", "block"] as const;

export const draftSafetyResultSchema = z.object({
  allow: z.boolean(),
  severity: z.enum(DRAFT_SAFETY_SEVERITIES),
  reason: z.string().trim().min(1).max(200),
  redFlags: z.array(z.string().trim().min(1).max(80)).max(6),
  suggestedRewrite: z
    .string()
    .trim()
    .max(220)
    .optional()
    .nullable()
    .transform((value) => value || undefined),
});

export const draftTagSuggestionSchema = z.object({
  suggestedTag: z.enum(GIST_TAGS),
  confidence: z.number().min(0).max(1),
  reason: z.string().trim().min(1).max(160),
});

export const relationSuggestionSchema = z.object({
  suggestedRelationType: z.enum(RELATION_TYPE_VALUES),
  confidence: z.number().min(0).max(1),
  reason: z.string().trim().min(1).max(160),
});

export const draftAssistRequestSchema = z.object({
  body: z.string().trim().min(1).max(MAX_GIST_LENGTH),
  currentTag: z.enum(GIST_TAGS).optional(),
  currentRelationType: z.enum(RELATION_TYPE_VALUES).optional(),
  parentGistText: z.string().trim().min(1).max(MAX_GIST_LENGTH).optional(),
  context: z.enum(DRAFT_CONTEXT_VALUES),
});

export const draftAssistResponseSchema = z.object({
  safety: draftSafetyResultSchema,
  tagSuggestion: draftTagSuggestionSchema,
  relationSuggestion: relationSuggestionSchema.optional(),
});

export type DraftContext = (typeof DRAFT_CONTEXT_VALUES)[number];
export type DraftSafetyResult = z.infer<typeof draftSafetyResultSchema>;
export type DraftTagSuggestion = z.infer<typeof draftTagSuggestionSchema>;
export type RelationSuggestion = z.infer<typeof relationSuggestionSchema>;
export type DraftAssistResponse = z.infer<typeof draftAssistResponseSchema>;
