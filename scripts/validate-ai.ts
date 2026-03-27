import {
  analyzeDraftSafety,
  suggestDraftTag,
  suggestRelationType,
} from "@/lib/server/ai/ai-service";
import { isGeminiConfigured } from "@/lib/server/ai/gemini";

async function main() {
  const blocked = await analyzeDraftSafety({
    gistText: "Call me on 08031234567 make I drop the account number 1234567890.",
    selectedTag: "General",
    context: "new-gist",
  });

  const warned = await analyzeDraftSafety({
    gistText: "That Pastor John for Grace Street still dey collect levy from people for that compound.",
    selectedTag: "General",
    context: "new-gist",
  });

  const allowed = await analyzeDraftSafety({
    gistText: "Two shops for this side say fuel price jump again this morning and queue long well.",
    selectedTag: "Fuel",
    context: "new-gist",
  });

  const tag = await suggestDraftTag({
    gistText: "Light don go again for our area since 4am and transformer still dey spark.",
    currentTag: "General",
  });

  const relation = await suggestRelationType({
    gistText: "Same thing dey happen for my own junction too since yesterday night.",
    parentGistText: "Transformer blow and light no stable for this street.",
    currentRelationType: "follow-up",
  });

  if (blocked.severity !== "block") {
    throw new Error("Expected obvious personal data sample to block.");
  }

  if (warned.severity === "allow") {
    throw new Error("Expected identifying role/place sample to warn or block.");
  }

  if (allowed.severity !== "allow") {
    throw new Error("Expected de-identified sample to pass.");
  }

  console.log("AI validation passed:");
  console.log(`- Gemini configured: ${isGeminiConfigured()}`);
  console.log(`- safety block: ${blocked.severity}`);
  console.log(`- safety warn: ${warned.severity}`);
  console.log(`- safety allow: ${allowed.severity}`);
  console.log(`- suggested tag: ${tag.suggestedTag} (${tag.confidence.toFixed(2)})`);
  console.log(
    `- suggested relation: ${relation.suggestedRelationType} (${relation.confidence.toFixed(2)})`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "AI validation failed.");
  process.exit(1);
});
