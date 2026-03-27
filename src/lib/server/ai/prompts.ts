import { GIST_TAGS, RELATION_TYPE_OPTIONS } from "@/lib/domain/constants";
import type { DraftContext } from "@/lib/ai/contracts";
import type { GistRelationType, GistTag } from "@/lib/domain/types";

function formatContext(context: DraftContext) {
  return context === "follow-up" ? "follow-up gist" : "new gist";
}

export function buildSafetyPrompt(input: {
  gistText: string;
  selectedTag?: GistTag;
  relationType?: GistRelationType;
  context: DraftContext;
}) {
  return [
    "You are reviewing an anonymous public post for GistMata, a Nigerian anonymous public-square app.",
    "Your job:",
    "- detect personal data",
    "- detect doxxing risk",
    "- detect whether the text identifies a private target too directly",
    "- allow sensitive or insider gist only if it is de-identified",
    '- enforce the rule: "Gist the matter, not the person."',
    "Block or warn for:",
    "- full names",
    "- phone numbers",
    "- emails",
    "- street or home addresses",
    "- bank account numbers",
    "- BVN, NIN, or similar government identifiers",
    "- combinations of role plus exact place plus identifying detail that expose a private individual",
    "Return strict JSON only with this shape:",
    '{"allow":boolean,"severity":"allow"|"warn"|"block","reason":"short string","redFlags":["string"],"suggestedRewrite":"optional short rewrite guidance"}',
    `Draft context: ${formatContext(input.context)}.`,
    `Selected tag: ${input.selectedTag ?? "none"}.`,
    `Selected relation type: ${input.relationType ?? "none"}.`,
    "Draft text:",
    input.gistText,
  ].join("\n");
}

export function buildTagPrompt(input: {
  gistText: string;
  currentTag?: GistTag;
}) {
  return [
    "Infer the most likely GistMata tag from the text.",
    `Choose only one from this exact tag list: ${GIST_TAGS.join(", ")}.`,
    "Be conservative.",
    'If confidence is low, return "General".',
    "Return strict JSON only with this shape:",
    '{"suggestedTag":"one tag from the list","confidence":0.0,"reason":"short string"}',
    `Current selected tag: ${input.currentTag ?? "none"}.`,
    "Draft text:",
    input.gistText,
  ].join("\n");
}

export function buildRelationPrompt(input: {
  gistText: string;
  parentGistText: string;
  currentRelationType?: GistRelationType;
}) {
  return [
    "Infer how a follow-up draft relates to the parent Gist.",
    `Choose exactly one relation type from this list: ${RELATION_TYPE_OPTIONS.map((option) => option.value).join(", ")}.`,
    "Meanings:",
    "- follow-up: general continuation",
    "- update: new development",
    "- confirm: corroborates the parent gist",
    "- counter: meaningfully disputes the parent gist",
    "- same-for-my-side: same issue in another nearby place or side",
    "Be conservative.",
    'If unclear, default to "follow-up".',
    "Return strict JSON only with this shape:",
    '{"suggestedRelationType":"one allowed value","confidence":0.0,"reason":"short string"}',
    `Current selected relation type: ${input.currentRelationType ?? "none"}.`,
    "Parent gist text:",
    input.parentGistText,
    "Follow-up draft text:",
    input.gistText,
  ].join("\n");
}
