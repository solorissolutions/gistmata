import { z } from "zod";

import {
  draftSafetyResultSchema,
  draftTagSuggestionSchema,
  relationSuggestionSchema,
  type DraftContext,
  type DraftSafetyResult,
  type DraftTagSuggestion,
  type RelationSuggestion,
} from "@/lib/ai/contracts";
import {
  GIST_TAGS,
  PERSONAL_DATA_BLOCK_MESSAGE,
  RELATION_TYPE_OPTIONS,
} from "@/lib/domain/constants";
import { detectPersonalData } from "@/lib/domain/moderation";
import type { GistRelationType, GistTag } from "@/lib/domain/types";
import {
  GeminiConfigurationError,
  GISTMATA_GEMINI_MODEL,
  getGeminiClient,
  isGeminiConfigured,
} from "@/lib/server/ai/gemini";
import {
  buildRelationPrompt,
  buildSafetyPrompt,
  buildTagPrompt,
} from "@/lib/server/ai/prompts";

const IDENTIFYING_ROLE_PATTERN =
  /\b(?:teacher|lecturer|doctor|nurse|manager|chairman|landlord|pastor|imam|principal|officer|director|oga|madam|driver)\b/i;
const EXACT_PLACE_PATTERN =
  /\b(?:at|for|inside|around|near|opposite)\s+[a-z0-9][a-z0-9' -]{2,}\b/i;
const FULL_NAME_PATTERN = /\b[A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}\b/;
const PHONE_WORDING_PATTERN = /\b(?:phone|number|whatsapp|call|reach)\b/i;

type SafetyInput = {
  gistText: string;
  selectedTag?: GistTag;
  relationType?: GistRelationType;
  context: DraftContext;
};

type TagInput = {
  gistText: string;
  currentTag?: GistTag;
};

type RelationInput = {
  gistText: string;
  parentGistText: string;
  currentRelationType?: GistRelationType;
};

export class DraftSafetyIssue extends Error {
  readonly severity: "warn" | "block";
  readonly redFlags: string[];
  readonly suggestedRewrite?: string;

  constructor(result: DraftSafetyResult) {
    super(formatDraftSafetyMessage(result));
    this.name = "DraftSafetyIssue";
    this.severity = result.severity === "block" ? "block" : "warn";
    this.redFlags = result.redFlags;
    this.suggestedRewrite = result.suggestedRewrite;
  }
}

function logAiEvent(
  action: "safety" | "tag" | "relation",
  payload: Record<string, string | number | boolean | null | undefined>,
) {
  console.info(
    `[gistmata-ai] ${JSON.stringify({
      action,
      at: new Date().toISOString(),
      ...payload,
    })}`,
  );
}

function normalizeJson(text: string) {
  const trimmed = text.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const match = trimmed.match(/\{[\s\S]*\}/);
  return match?.[0] ?? trimmed;
}

async function requestGeminiJson<T>(prompt: string, schema: z.ZodType<T>) {
  const client = getGeminiClient();
  const response = await client.models.generateContent({
    model: GISTMATA_GEMINI_MODEL,
    contents: prompt,
    config: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  });
  const jsonText = normalizeJson(response.text ?? "");

  if (!jsonText) {
    throw new Error("Gemini returned an empty response.");
  }

  return schema.parse(JSON.parse(jsonText));
}

function toBlockResult(redFlags: string[], reason = PERSONAL_DATA_BLOCK_MESSAGE): DraftSafetyResult {
  return {
    allow: false,
    severity: "block",
    reason,
    redFlags,
    suggestedRewrite: undefined,
  };
}

function toWarnResult(reason: string, redFlags: string[], suggestedRewrite?: string): DraftSafetyResult {
  return {
    allow: false,
    severity: "warn",
    reason,
    redFlags,
    suggestedRewrite,
  };
}

function toAllowResult(reason = "Draft looks de-identified enough to post."): DraftSafetyResult {
  return {
    allow: true,
    severity: "allow",
    reason,
    redFlags: [],
    suggestedRewrite: undefined,
  };
}

function runLocalSafetyRules(input: SafetyInput): DraftSafetyResult {
  const personalData = detectPersonalData(input.gistText);

  if (personalData.blocked) {
    return toBlockResult(personalData.hits, PERSONAL_DATA_BLOCK_MESSAGE);
  }

  if (FULL_NAME_PATTERN.test(input.gistText)) {
    return toWarnResult(
      "This draft may still point to a private person too directly.",
      ["possible-full-name"],
      "Shift the gist toward the matter and remove the person name.",
    );
  }

  if (
    IDENTIFYING_ROLE_PATTERN.test(input.gistText) &&
    EXACT_PLACE_PATTERN.test(input.gistText)
  ) {
    return toWarnResult(
      "This draft may narrow a private target too much with role and place together.",
      ["role-place-combo"],
      "Broaden the location or remove the exact role detail before posting.",
    );
  }

  if (PHONE_WORDING_PATTERN.test(input.gistText) && /\d{6,}/.test(input.gistText)) {
    return toBlockResult(["contact-details"], PERSONAL_DATA_BLOCK_MESSAGE);
  }

  return toAllowResult();
}

function combineSafety(
  localResult: DraftSafetyResult,
  aiResult: DraftSafetyResult | null,
): DraftSafetyResult {
  if (localResult.severity === "block") {
    return localResult;
  }

  if (!aiResult) {
    return localResult;
  }

  if (aiResult.severity === "block") {
    return aiResult;
  }

  if (localResult.severity === "warn") {
    return {
      ...localResult,
      redFlags: [...new Set([...localResult.redFlags, ...aiResult.redFlags])],
      suggestedRewrite: localResult.suggestedRewrite ?? aiResult.suggestedRewrite,
    };
  }

  if (aiResult.severity === "warn") {
    return aiResult;
  }

  return aiResult;
}

const TAG_KEYWORDS: Array<{ tag: GistTag; patterns: RegExp[] }> = [
  { tag: "NEPA", patterns: [/\bnepa\b/i, /\blight\b/i, /\bpower\b/i, /\btransformer\b/i] },
  { tag: "Fuel", patterns: [/\bfuel\b/i, /\bpetrol\b/i, /\bdiesel\b/i, /\bpms\b/i] },
  { tag: "Govt", patterns: [/\bgovern(or|ment)\b/i, /\blga\b/i, /\bministry\b/i, /\bsenator\b/i] },
  { tag: "Safety", patterns: [/\bthief\b/i, /\brobbery\b/i, /\bkidnap\b/i, /\bsecurity\b/i, /\bpolice\b/i] },
  { tag: "Market", patterns: [/\bmarket\b/i, /\bprice\b/i, /\bseller\b/i, /\bbuyer\b/i] },
  { tag: "Road", patterns: [/\btraffic\b/i, /\broad\b/i, /\bpothole\b/i, /\bbridge\b/i] },
  { tag: "Japa", patterns: [/\bjapa\b/i, /\bvisa\b/i, /\bembassy\b/i, /\btravel\b/i, /\babroad\b/i] },
  { tag: "Jobs", patterns: [/\bjob\b/i, /\binterview\b/i, /\bsalary\b/i, /\bhiring\b/i, /\bemployment\b/i] },
  { tag: "Landlord", patterns: [/\blandlord\b/i, /\brent\b/i, /\btenant\b/i, /\bcompound\b/i] },
  { tag: "Church", patterns: [/\bchurch\b/i, /\bpastor\b/i, /\bservice\b/i, /\bprayer\b/i] },
  { tag: "Entertainment", patterns: [/\bmusic\b/i, /\bmovie\b/i, /\bshow\b/i, /\bcelebrity\b/i] },
  { tag: "Adult", patterns: [/\bsex\b/i, /\bhookup\b/i, /\bbedroom\b/i, /\bcheat(?:ing)?\b/i] },
];

function fallbackTagSuggestion(input: TagInput): DraftTagSuggestion {
  for (const entry of TAG_KEYWORDS) {
    if (entry.patterns.some((pattern) => pattern.test(input.gistText))) {
      return {
        suggestedTag: entry.tag,
        confidence: 0.72,
        reason: "Keyword match from the draft text.",
      };
    }
  }

  return {
    suggestedTag: input.currentTag ?? "General",
    confidence: input.currentTag ? 0.52 : 0.34,
    reason: input.currentTag
      ? "Keeping your current tag because the draft is still broad."
      : "Defaulting to General because the draft is broad or confidence is low.",
  };
}

function fallbackRelationSuggestion(input: RelationInput): RelationSuggestion {
  const draft = input.gistText.toLowerCase();

  if (/\b(update|latest|don change|fixed|resolved|new development)\b/i.test(draft)) {
    return {
      suggestedRelationType: "update",
      confidence: 0.73,
      reason: "The draft reads like a fresh development.",
    };
  }

  if (/\b(confirm|true|i saw|na true|same witness)\b/i.test(draft)) {
    return {
      suggestedRelationType: "confirm",
      confidence: 0.74,
      reason: "The draft reads like corroboration.",
    };
  }

  if (/\b(counter|not true|different here|lie|no be so)\b/i.test(draft)) {
    return {
      suggestedRelationType: "counter",
      confidence: 0.74,
      reason: "The draft disputes the parent gist.",
    };
  }

  if (/\b(same for my side|same here|same thing here|same issue here)\b/i.test(draft)) {
    return {
      suggestedRelationType: "same-for-my-side",
      confidence: 0.78,
      reason: "The draft says the same issue is happening elsewhere nearby.",
    };
  }

  return {
    suggestedRelationType: input.currentRelationType ?? "follow-up",
    confidence: input.currentRelationType ? 0.56 : 0.4,
    reason: "Defaulting to a general follow-up relation.",
  };
}

export function formatDraftSafetyMessage(result: DraftSafetyResult) {
  if (result.severity === "block") {
    return PERSONAL_DATA_BLOCK_MESSAGE;
  }

  const rewrite = result.suggestedRewrite ? ` ${result.suggestedRewrite}` : "";
  return `${result.reason}${rewrite}`;
}

export async function analyzeDraftSafety(input: SafetyInput): Promise<DraftSafetyResult> {
  const localResult = runLocalSafetyRules(input);

  if (localResult.severity === "block") {
    logAiEvent("safety", {
      source: "local",
      severity: localResult.severity,
      redFlags: localResult.redFlags.join(","),
    });
    return localResult;
  }

  if (!isGeminiConfigured()) {
    logAiEvent("safety", {
      source: "fallback",
      severity: localResult.severity,
      reason: "missing-key",
    });
    return localResult;
  }

  try {
    const aiResult = await requestGeminiJson(
      buildSafetyPrompt(input),
      draftSafetyResultSchema,
    );
    const finalResult = combineSafety(localResult, aiResult);
    logAiEvent("safety", {
      source: "gemini",
      severity: finalResult.severity,
      allow: finalResult.allow,
    });
    return finalResult;
  } catch (error) {
    logAiEvent("safety", {
      source: "fallback",
      severity: localResult.severity,
      reason:
        error instanceof GeminiConfigurationError || error instanceof Error
          ? error.name
          : "unknown",
      detail: error instanceof Error ? error.message.slice(0, 160) : undefined,
    });
    return localResult;
  }
}

export async function ensureDraftSafety(input: SafetyInput) {
  const result = await analyzeDraftSafety(input);

  if (!result.allow) {
    throw new DraftSafetyIssue(result);
  }

  return result;
}

export async function suggestDraftTag(input: TagInput): Promise<DraftTagSuggestion> {
  const fallback = fallbackTagSuggestion(input);

  if (!isGeminiConfigured() || input.gistText.trim().length < 20) {
    logAiEvent("tag", {
      source: "fallback",
      suggestedTag: fallback.suggestedTag,
      confidence: fallback.confidence,
    });
    return fallback;
  }

  try {
    const result = await requestGeminiJson(
      buildTagPrompt(input),
      draftTagSuggestionSchema,
    );

    if (!GIST_TAGS.includes(result.suggestedTag)) {
      return fallback;
    }

    logAiEvent("tag", {
      source: "gemini",
      suggestedTag: result.suggestedTag,
      confidence: result.confidence,
    });
    return result;
  } catch (error) {
    logAiEvent("tag", {
      source: "fallback",
      suggestedTag: fallback.suggestedTag,
      confidence: fallback.confidence,
      reason: error instanceof Error ? error.name : "unknown",
      detail: error instanceof Error ? error.message.slice(0, 160) : undefined,
    });
    return fallback;
  }
}

export async function suggestRelationType(
  input: RelationInput,
): Promise<RelationSuggestion> {
  const fallback = fallbackRelationSuggestion(input);

  if (
    !isGeminiConfigured() ||
    input.gistText.trim().length < 16 ||
    input.parentGistText.trim().length < 8
  ) {
    logAiEvent("relation", {
      source: "fallback",
      suggestedRelationType: fallback.suggestedRelationType,
      confidence: fallback.confidence,
    });
    return fallback;
  }

  try {
    const result = await requestGeminiJson(
      buildRelationPrompt(input),
      relationSuggestionSchema,
    );

    if (
      !RELATION_TYPE_OPTIONS.some(
        (option) => option.value === result.suggestedRelationType,
      )
    ) {
      return fallback;
    }

    logAiEvent("relation", {
      source: "gemini",
      suggestedRelationType: result.suggestedRelationType,
      confidence: result.confidence,
    });
    return result;
  } catch (error) {
    logAiEvent("relation", {
      source: "fallback",
      suggestedRelationType: fallback.suggestedRelationType,
      confidence: fallback.confidence,
      reason: error instanceof Error ? error.name : "unknown",
      detail: error instanceof Error ? error.message.slice(0, 160) : undefined,
    });
    return fallback;
  }
}
