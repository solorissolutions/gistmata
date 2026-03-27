import assert from "node:assert/strict";

import { loadEnvConfig } from "@next/env";

import { getLocationProviderInfo, resolveLocation } from "@/lib/server/location";
import {
  addCommentToGist,
  beginJoinDraft,
  completeJoinDraft,
  createSession,
  createContactOgaMessage,
  createSurvey,
  deleteSession,
  dropGist,
  dropFollowUpGist,
  generateReferralCodes,
  getFeedBundle,
  getOgaGrowthBundle,
  getOgaInboxBundle,
  getOgaOverviewBundle,
  getOgaTrustBundle,
  getUserBySessionToken,
  loginWithUsernameAndPin,
  readStore,
  recoverSession,
  reportGist,
  resetDemoStore,
  setContactOgaMessageStatus,
  setGistStatus,
  setJoinDraftBasics,
  setJoinDraftPin,
  setJoinDraftUsername,
  setPinnedGistPriority,
  toggleSavedGist,
  unpinGist,
  voteInSurvey,
} from "@/lib/server/store";

loadEnvConfig(process.cwd());

async function main() {
  await resetDemoStore();

  const draft = await beginJoinDraft("GREEN-MATA");
  await setJoinDraftUsername(draft.id, "MataRider");
  await setJoinDraftPin(draft.id, "123456");
  await setJoinDraftBasics(draft.id, {
    state: "Oyo",
    ageRange: "25-34",
    gender: "Prefer not to say",
  });
  const completed = await completeJoinDraft(draft.id);
  const token = await createSession(completed.userId);
  const viewer = await getUserBySessionToken(token);
  assert.ok(viewer);
  assert.equal(viewer.username, "MataRider");

  const loginResult = await loginWithUsernameAndPin("MataRider", "123456");
  assert.equal(loginResult.user.username, "MataRider");
  const recoveryResult = await recoverSession(completed.accountCode, "123456");
  assert.equal(recoveryResult.user.username, "MataRider");
  await deleteSession(loginResult.token);
  await deleteSession(recoveryResult.token);

  const location = await resolveLocation({ homeState: viewer.homeState });
  assert.ok(location.provider);
  assert.equal(getLocationProviderInfo().key, "mock");
  const gistId = await dropGist({
    viewerId: viewer.id,
    body: "Demo join flow complete. Bodija side just settle after morning rain.",
    tag: "General",
    location,
  });

  const feed = await getFeedBundle({
    viewerId: viewer.id,
    level: "state",
    tag: "All",
    sort: "recent",
  });
  assert.ok(feed.gists.some((gist) => gist.id === gistId));
  assert.ok(feed.gists.every((gist) => gist.authorTier));
  assert.ok(feed.gists.every((gist) => gist.viewerLevel));

  const storeAfterDrop = await readStore();
  const targetGist = storeAfterDrop.gists.find((gist) => gist.id !== gistId);
  const survey = storeAfterDrop.surveys.find((entry) => entry.status === "live");
  const oga = storeAfterDrop.users.find((user) => user.isOga);
  assert.ok(targetGist);
  assert.ok(survey);
  assert.ok(oga);

  const followUpId = await dropFollowUpGist({
    viewerId: viewer.id,
    parentGistId: targetGist.id,
    relationType: "follow-up",
    body: "Follow-up validation gist from the same matter chain.",
    tag: "General",
    location,
  });
  assert.ok(followUpId);

  await addCommentToGist({
    viewerId: viewer.id,
    gistId: targetGist.id,
    body: "This one clear. Make them hold the line well.",
  });
  await reportGist({
    viewerId: viewer.id,
    gistId: targetGist.id,
    type: "general",
    reasonText: "Validation report path",
  });
  const saved = await toggleSavedGist({
    viewerId: viewer.id,
    gistId: targetGist.id,
  });
  assert.equal(saved.saved, true);
  const unsaved = await toggleSavedGist({
    viewerId: viewer.id,
    gistId: targetGist.id,
  });
  assert.equal(unsaved.saved, false);
  await voteInSurvey({
    viewerId: viewer.id,
    surveyId: survey.id,
    optionId: storeAfterDrop.surveyOptions.find((option) => option.surveyId === survey.id)!.id,
  });
  await createContactOgaMessage({
    senderUserId: viewer.id,
    category: "Suggestion",
    body: "Validation contact to oga inbox.",
    accountCodeReference: completed.accountCode.slice(-4),
  });

  await createSurvey({
    ogaId: oga.id,
    question: "Validation survey for oga route",
    scopeType: "nigeria",
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    options: ["Power", "Fuel", "Road"],
  });
  const codes = await generateReferralCodes(oga.id, 2);
  assert.equal(codes.length, 2);
  await setPinnedGistPriority({ ogaId: oga.id, gistId: targetGist.id, priority: 3 });
  await unpinGist({ ogaId: oga.id, gistId: targetGist.id });
  await setGistStatus({ ogaId: oga.id, gistId: targetGist.id, status: "removed" });
  await setGistStatus({ ogaId: oga.id, gistId: targetGist.id, status: "active" });
  const ogaToken = await createSession(oga.id);
  const ogaViewer = await getUserBySessionToken(ogaToken);
  assert.ok(ogaViewer?.isOga);
  const ogaOverview = await getOgaOverviewBundle();
  assert.ok(ogaOverview.metrics.totalUsers >= 1);
  const trustBundle = await getOgaTrustBundle();
  assert.ok(trustBundle.summary.total >= 1);
  const growthBundle = await getOgaGrowthBundle();
  assert.ok(growthBundle.activationMetrics.totalCodes >= 1);
  const inboxBundle = await getOgaInboxBundle();
  assert.ok(inboxBundle.messages.length >= 1);
  await setContactOgaMessageStatus({
    ogaId: oga.id,
    messageId: inboxBundle.messages[0]!.id,
    status: "read",
  });

  console.log("Validation passed:");
  console.log("- referral-gated join");
  console.log("- login and recovery");
  console.log("- session creation");
  console.log("- Drop Gist with resolved location provider");
  console.log("- follow-up gist");
  console.log("- comment flow");
  console.log("- report gist flow");
  console.log("- save / unsave flow");
  console.log("- contact oga / inbox flow");
  console.log("- trust queue summary");
  console.log("- survey vote");
  console.log("- oga survey creation");
  console.log("- oga referral generation");
  console.log("- oga pin / unpin / moderation flow");
  console.log("- oga growth bundle");
  console.log("- oga protected data bundle");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
