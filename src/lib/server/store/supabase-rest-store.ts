import "server-only";

import type { AppStore } from "@/lib/domain/types";
import { getSupabaseServerClient } from "@/lib/server/supabase/client";

type OrderInput = {
  column: string;
  ascending?: boolean;
};

const DELETE_ORDER = [
  ["survey_votes", "id"],
  ["survey_options", "id"],
  ["surveys", "id"],
  ["gist_reactions", "id"],
  ["gist_comments", "id"],
  ["gist_reports", "id"],
  ["gist_relations", "id"],
  ["saved_gists", "id"],
  ["intel_submissions", "id"],
  ["pinned_gists", "gist_id"],
  ["alerts", "id"],
  ["contact_messages", "id"],
  ["prediction_modules", "id"],
  ["user_points_ledger", "id"],
  ["user_trust_profiles", "user_id"],
  ["oga_actions", "id"],
  ["location_cache", "id"],
  ["sessions", "id"],
  ["join_drafts", "id"],
  ["account_recovery_events", "id"],
  ["referral_codes", "id"],
  ["gists", "id"],
  ["feature_flags", "key"],
  ["users", "id"],
] as const;

function getClient() {
  const client = getSupabaseServerClient();

  if (!client) {
    throw new Error("Supabase server client is not configured.");
  }

  return client;
}

export function isSupabaseRestStoreConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      (process.env.SUPABASE_SECRET_KEY?.trim() ||
        process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
  );
}

async function selectAll(table: string, order?: OrderInput) {
  const client = getClient();
  let query = client.from(table).select("*");

  if (order) {
    query = query.order(order.column, { ascending: order.ascending ?? true });
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }

  return data ?? [];
}

function toIsoString(value: unknown) {
  return new Date(String(value)).toISOString();
}

function toNullableIsoString(value: unknown) {
  return value == null ? null : toIsoString(value);
}

function toNumber(value: unknown) {
  return value == null ? 0 : Number(value);
}

export async function loadSupabaseRestStore(): Promise<AppStore> {
  const [
    users,
    sessions,
    joinDrafts,
    referralCodes,
    accountRecoveryEvents,
    gists,
    gistRelations,
    gistReactions,
    gistComments,
    gistReports,
    surveys,
    surveyOptions,
    surveyVotes,
    alerts,
    savedGists,
    contactMessages,
    intelSubmissions,
    pinnedGists,
    predictionModules,
    userPointsLedger,
    userTrustProfiles,
    ogaActions,
    locationCache,
    featureFlags,
  ] = await Promise.all([
    selectAll("users", { column: "created_at", ascending: false }),
    selectAll("sessions", { column: "created_at", ascending: false }),
    selectAll("join_drafts", { column: "created_at", ascending: false }),
    selectAll("referral_codes", { column: "code" }),
    selectAll("account_recovery_events", { column: "created_at", ascending: false }),
    selectAll("gists", { column: "created_at", ascending: false }),
    selectAll("gist_relations", { column: "created_at", ascending: false }),
    selectAll("gist_reactions", { column: "created_at", ascending: false }),
    selectAll("gist_comments", { column: "created_at", ascending: false }),
    selectAll("gist_reports", { column: "created_at", ascending: false }),
    selectAll("surveys", { column: "created_at", ascending: false }),
    selectAll("survey_options", { column: "label" }),
    selectAll("survey_votes", { column: "created_at", ascending: false }),
    selectAll("alerts", { column: "created_at", ascending: false }),
    selectAll("saved_gists", { column: "created_at", ascending: false }),
    selectAll("contact_messages", { column: "created_at", ascending: false }),
    selectAll("intel_submissions", { column: "created_at", ascending: false }),
    selectAll("pinned_gists", { column: "priority" }),
    selectAll("prediction_modules", { column: "created_at", ascending: false }),
    selectAll("user_points_ledger", { column: "created_at", ascending: false }),
    selectAll("user_trust_profiles", { column: "last_updated_at", ascending: false }),
    selectAll("oga_actions", { column: "created_at", ascending: false }),
    selectAll("location_cache", { column: "updated_at", ascending: false }),
    selectAll("feature_flags", { column: "key" }),
  ]);

  return {
    users: users.map((row) => ({
      id: String(row.id),
      username: String(row.username),
      usernameNormalized: String(row.username_normalized),
      pinHash: String(row.pin_hash),
      accountCodeHash: String(row.account_code_hash),
      homeState: String(row.home_state),
      ageRange: row.age_range,
      gender: row.gender,
      tier: row.tier,
      pointsBalance: toNumber(row.points_balance),
      isOga: Boolean(row.is_oga),
      comotTagged: Boolean(row.comot_tagged),
      createdAt: toIsoString(row.created_at),
      lastActiveAt: toIsoString(row.last_active_at),
      homeAreaDisplay: row.home_area_display ? String(row.home_area_display) : null,
      homeAreaBucket: row.home_area_bucket ? String(row.home_area_bucket) : null,
      homeAdmin2Name: row.home_admin2_name ? String(row.home_admin2_name) : null,
      homeAdmin2Type: row.home_admin2_type ? String(row.home_admin2_type) : null,
      locationConfidence:
        row.location_confidence == null ? null : toNumber(row.location_confidence),
      referredByUserId: row.referred_by_user_id ? String(row.referred_by_user_id) : null,
      referralCodeUsed: row.referral_code_used ? String(row.referral_code_used) : null,
      devRecoveryCode: row.dev_recovery_code ? String(row.dev_recovery_code) : null,
    })),
    sessions: sessions.map((row) => ({
      id: String(row.id),
      userId: String(row.user_id),
      tokenHash: String(row.token_hash),
      createdAt: toIsoString(row.created_at),
      expiresAt: toIsoString(row.expires_at),
      lastSeenAt: toIsoString(row.last_seen_at),
    })),
    joinDrafts: joinDrafts.map((row) => ({
      id: String(row.id),
      referralCodeId: String(row.referral_code_id),
      referralCode: String(row.referral_code),
      username: row.username ? String(row.username) : null,
      usernameNormalized: row.username_normalized ? String(row.username_normalized) : null,
      pinHash: row.pin_hash ? String(row.pin_hash) : null,
      accountCode: row.account_code ? String(row.account_code) : null,
      accountCodeHash: row.account_code_hash ? String(row.account_code_hash) : null,
      state: row.state ? String(row.state) : null,
      ageRange: row.age_range ?? null,
      gender: row.gender ?? null,
      createdAt: toIsoString(row.created_at),
    })),
    referralCodes: referralCodes.map((row) => ({
      id: String(row.id),
      code: String(row.code),
      createdByUserId: String(row.created_by_user_id),
      usedByUserId: row.used_by_user_id ? String(row.used_by_user_id) : null,
      usedAt: toNullableIsoString(row.used_at),
      expiresAt: toNullableIsoString(row.expires_at),
      isActive: Boolean(row.is_active),
    })),
    accountRecoveryEvents: accountRecoveryEvents.map((row) => ({
      id: String(row.id),
      userId: row.user_id ? String(row.user_id) : "",
      success: Boolean(row.success),
      createdAt: toIsoString(row.created_at),
    })),
    gists: gists.map((row) => ({
      id: String(row.id),
      authorUserId: String(row.author_user_id),
      body: String(row.body),
      tag: row.tag,
      areaDisplay: String(row.area_display),
      areaBucket: String(row.area_bucket),
      admin2Name: String(row.admin2_name),
      admin2Type: String(row.admin2_type),
      stateName: String(row.state_name),
      feedVisibilityScore: toNumber(row.feed_visibility_score),
      translationText: row.translation_text ? String(row.translation_text) : null,
      commentsCount: toNumber(row.comments_count),
      reactionsCount: toNumber(row.reactions_count),
      reportsCount: toNumber(row.reports_count),
      followUpCount: toNumber(row.follow_up_count),
      status: row.status,
      createdAt: toIsoString(row.created_at),
    })),
    gistRelations: gistRelations.map((row) => ({
      id: String(row.id),
      childGistId: String(row.child_gist_id),
      parentGistId: String(row.parent_gist_id),
      relationType: row.relation_type,
      createdAt: toIsoString(row.created_at),
    })),
    gistReactions: gistReactions.map((row) => ({
      id: String(row.id),
      gistId: String(row.gist_id),
      userId: String(row.user_id),
      type: row.type,
      createdAt: toIsoString(row.created_at),
    })),
    gistComments: gistComments.map((row) => ({
      id: String(row.id),
      gistId: String(row.gist_id),
      authorUserId: String(row.author_user_id),
      body: String(row.body),
      status: row.status,
      createdAt: toIsoString(row.created_at),
      parentCommentId: row.parent_comment_id ? String(row.parent_comment_id) : null,
    })),
    gistReports: gistReports.map((row) => ({
      id: String(row.id),
      gistId: String(row.gist_id),
      reporterUserId: String(row.reporter_user_id),
      type: row.type,
      reasonText: row.reason_text ? String(row.reason_text) : null,
      status: row.status ?? "open",
      triagedAt: toNullableIsoString(row.triaged_at),
      resolvedAt: toNullableIsoString(row.resolved_at),
      resolvedByOgaUserId: row.resolved_by_oga_user_id
        ? String(row.resolved_by_oga_user_id)
        : null,
      resolutionNotes: row.resolution_notes ? String(row.resolution_notes) : null,
      createdAt: toIsoString(row.created_at),
    })),
    surveys: surveys.map((row) => ({
      id: String(row.id),
      question: String(row.question),
      createdByUserId: String(row.created_by_user_id),
      scopeType: row.scope_type,
      scopeValue: row.scope_value ? String(row.scope_value) : null,
      status: row.status,
      pinned: Boolean(row.pinned),
      startsAt: toIsoString(row.starts_at),
      endsAt: toIsoString(row.ends_at),
      createdAt: toIsoString(row.created_at),
      pointsReward: toNumber(row.points_reward),
    })),
    surveyOptions: surveyOptions.map((row) => ({
      id: String(row.id),
      surveyId: String(row.survey_id),
      label: String(row.label),
      votesCount: toNumber(row.votes_count),
    })),
    surveyVotes: surveyVotes.map((row) => ({
      id: String(row.id),
      surveyId: String(row.survey_id),
      optionId: String(row.option_id),
      userId: String(row.user_id),
      createdAt: toIsoString(row.created_at),
    })),
    alerts: alerts.map((row) => ({
      id: String(row.id),
      userId: String(row.user_id),
      type: row.type,
      title: String(row.title),
      body: String(row.body),
      link: String(row.link),
      readAt: toNullableIsoString(row.read_at),
      createdAt: toIsoString(row.created_at),
    })),
    savedGists: savedGists.map((row) => ({
      id: String(row.id),
      userId: String(row.user_id),
      gistId: String(row.gist_id),
      createdAt: toIsoString(row.created_at),
    })),
    contactOgaMessages: contactMessages.map((row) => ({
      id: String(row.id),
      senderUserId: row.sender_user_id ? String(row.sender_user_id) : null,
      senderIdentity: String(row.sender_identity),
      accountCodeReference: row.account_code_reference
        ? String(row.account_code_reference)
        : null,
      category: row.category ?? null,
      body: String(row.body),
      status: row.status,
      createdAt: toIsoString(row.created_at),
      readAt: toNullableIsoString(row.read_at),
    })),
    intelSubmissions: intelSubmissions.map((row) => ({
      id: String(row.id),
      contactMessageId: String(row.contact_message_id),
      senderUserId: row.sender_user_id ? String(row.sender_user_id) : null,
      senderIdentity: String(row.sender_identity),
      accountCodeReference: row.account_code_reference
        ? String(row.account_code_reference)
        : null,
      method: row.method,
      urgency: row.urgency,
      summary: String(row.summary),
      body: String(row.body),
      locationHint: row.location_hint ? String(row.location_hint) : null,
      linkedGistReference: row.linked_gist_reference
        ? String(row.linked_gist_reference)
        : null,
      status: row.status,
      createdAt: toIsoString(row.created_at),
      reviewedAt: toNullableIsoString(row.reviewed_at),
    })),
    pinnedGists: pinnedGists.map((row) => ({
      gistId: String(row.gist_id),
      priority: toNumber(row.priority) as 1 | 2 | 3,
      pinnedByUserId: String(row.pinned_by_user_id),
      createdAt: toIsoString(row.created_at),
      updatedAt: toIsoString(row.updated_at),
    })),
    predictionModules: predictionModules.map((row) => ({
      id: String(row.id),
      title: String(row.title),
      body: String(row.body),
      kicker: String(row.kicker),
      status: row.status,
      createdByUserId: String(row.created_by_user_id),
      createdAt: toIsoString(row.created_at),
    })),
    userPointsLedger: userPointsLedger.map((row) => ({
      id: String(row.id),
      userId: String(row.user_id),
      eventType: row.event_type,
      pointsDelta: toNumber(row.points_delta),
      metadata: row.metadata ?? {},
      createdAt: toIsoString(row.created_at),
    })),
    userTrustProfiles: userTrustProfiles.map((row) => ({
      userId: String(row.user_id),
      trustScore: toNumber(row.trust_score),
      personalDataStrikes: toNumber(row.personal_data_strikes),
      fakeLocationStrikes: toNumber(row.fake_location_strikes),
      validReportCount: toNumber(row.valid_report_count),
      invalidReportCount: toNumber(row.invalid_report_count),
      lastUpdatedAt: toIsoString(row.last_updated_at),
    })),
    ogaActions: ogaActions.map((row) => ({
      id: String(row.id),
      ogaUserId: String(row.oga_user_id),
      actionType: String(row.action_type),
      targetType: String(row.target_type),
      targetId: String(row.target_id),
      notes: row.notes ? String(row.notes) : null,
      createdAt: toIsoString(row.created_at),
    })),
    locationCache: locationCache.map((row) => ({
      id: String(row.id),
      displayLocality: String(row.display_locality),
      areaBucket: String(row.area_bucket),
      admin2Name: String(row.admin2_name),
      admin2Type: String(row.admin2_type),
      stateName: String(row.state_name),
      confidenceScore: toNumber(row.confidence_score),
      provider: String(row.provider),
      providerRef: row.provider_ref ? String(row.provider_ref) : null,
      createdAt: toIsoString(row.created_at),
      updatedAt: toIsoString(row.updated_at),
    })),
    featureFlags: featureFlags.map((row) => ({
      key: row.key,
      enabled: Boolean(row.enabled),
      description: String(row.description),
    })),
  };
}

async function deleteAll(table: string, keyColumn: string) {
  const client = getClient();
  const { error } = await client.from(table).delete().not(keyColumn, "is", null);

  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }
}

function chunkRows<T>(rows: T[], size = 200) {
  const chunks: T[][] = [];

  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size));
  }

  return chunks;
}

async function insertRows(table: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    return;
  }

  const client = getClient();

  for (const chunk of chunkRows(rows)) {
    const { error } = await client.from(table).insert(chunk);

    if (error) {
      throw new Error(`${table}: ${error.message}`);
    }
  }
}

export async function replaceSupabaseRestStore(store: AppStore) {
  for (const [table, keyColumn] of DELETE_ORDER) {
    await deleteAll(table, keyColumn);
  }

  await insertRows(
    "users",
    store.users.map((user) => ({
      id: user.id,
      username: user.username,
      username_normalized: user.usernameNormalized,
      pin_hash: user.pinHash,
      account_code_hash: user.accountCodeHash,
      dev_recovery_code: user.devRecoveryCode ?? null,
      home_state: user.homeState,
      home_area_display: user.homeAreaDisplay,
      home_area_bucket: user.homeAreaBucket,
      home_admin2_name: user.homeAdmin2Name,
      home_admin2_type: user.homeAdmin2Type,
      location_confidence: user.locationConfidence,
      age_range: user.ageRange,
      gender: user.gender,
      tier: user.tier,
      points_balance: user.pointsBalance,
      is_oga: user.isOga,
      comot_tagged: user.comotTagged,
      referred_by_user_id: user.referredByUserId,
      referral_code_used: user.referralCodeUsed,
      created_at: user.createdAt,
      last_active_at: user.lastActiveAt,
    })),
  );

  await insertRows(
    "feature_flags",
    store.featureFlags.map((flag) => ({
      key: flag.key,
      enabled: flag.enabled,
      description: flag.description,
    })),
  );

  await insertRows(
    "referral_codes",
    store.referralCodes.map((entry) => ({
      id: entry.id,
      code: entry.code,
      created_by_user_id: entry.createdByUserId,
      used_by_user_id: entry.usedByUserId,
      used_at: entry.usedAt,
      expires_at: entry.expiresAt,
      is_active: entry.isActive,
    })),
  );

  await insertRows(
    "join_drafts",
    store.joinDrafts.map((entry) => ({
      id: entry.id,
      referral_code_id: entry.referralCodeId,
      referral_code: entry.referralCode,
      username: entry.username,
      username_normalized: entry.usernameNormalized,
      pin_hash: entry.pinHash,
      account_code: entry.accountCode,
      account_code_hash: entry.accountCodeHash,
      state: entry.state,
      age_range: entry.ageRange,
      gender: entry.gender,
      created_at: entry.createdAt,
    })),
  );

  await insertRows(
    "sessions",
    store.sessions.map((entry) => ({
      id: entry.id,
      user_id: entry.userId,
      token_hash: entry.tokenHash,
      created_at: entry.createdAt,
      expires_at: entry.expiresAt,
      last_seen_at: entry.lastSeenAt,
    })),
  );

  await insertRows(
    "account_recovery_events",
    store.accountRecoveryEvents.map((entry) => ({
      id: entry.id,
      user_id: entry.userId || null,
      success: entry.success,
      created_at: entry.createdAt,
    })),
  );

  await insertRows(
    "gists",
    store.gists.map((entry) => ({
      id: entry.id,
      author_user_id: entry.authorUserId,
      body: entry.body,
      tag: entry.tag,
      area_display: entry.areaDisplay,
      area_bucket: entry.areaBucket,
      admin2_name: entry.admin2Name,
      admin2_type: entry.admin2Type,
      state_name: entry.stateName,
      feed_visibility_score: entry.feedVisibilityScore,
      translation_text: entry.translationText,
      comments_count: entry.commentsCount,
      reactions_count: entry.reactionsCount,
      reports_count: entry.reportsCount,
      follow_up_count: entry.followUpCount,
      status: entry.status,
      created_at: entry.createdAt,
    })),
  );

  await insertRows(
    "gist_relations",
    store.gistRelations.map((entry) => ({
      id: entry.id,
      child_gist_id: entry.childGistId,
      parent_gist_id: entry.parentGistId,
      relation_type: entry.relationType,
      created_at: entry.createdAt,
    })),
  );

  await insertRows(
    "gist_reactions",
    store.gistReactions.map((entry) => ({
      id: entry.id,
      gist_id: entry.gistId,
      user_id: entry.userId,
      type: entry.type,
      created_at: entry.createdAt,
    })),
  );

  await insertRows(
    "gist_comments",
    store.gistComments.map((entry) => ({
      id: entry.id,
      gist_id: entry.gistId,
      author_user_id: entry.authorUserId,
      body: entry.body,
      status: entry.status,
      created_at: entry.createdAt,
      parent_comment_id: entry.parentCommentId,
    })),
  );

  await insertRows(
    "gist_reports",
    store.gistReports.map((entry) => ({
      id: entry.id,
      gist_id: entry.gistId,
      reporter_user_id: entry.reporterUserId,
      type: entry.type,
      reason_text: entry.reasonText,
      status: entry.status ?? "open",
      triaged_at: entry.triagedAt ?? null,
      resolved_at: entry.resolvedAt ?? null,
      resolved_by_oga_user_id: entry.resolvedByOgaUserId ?? null,
      resolution_notes: entry.resolutionNotes ?? null,
      created_at: entry.createdAt,
    })),
  );

  await insertRows(
    "surveys",
    store.surveys.map((entry) => ({
      id: entry.id,
      question: entry.question,
      created_by_user_id: entry.createdByUserId,
      scope_type: entry.scopeType,
      scope_value: entry.scopeValue,
      status: entry.status,
      pinned: entry.pinned,
      starts_at: entry.startsAt,
      ends_at: entry.endsAt,
      created_at: entry.createdAt,
      points_reward: entry.pointsReward,
    })),
  );

  await insertRows(
    "survey_options",
    store.surveyOptions.map((entry) => ({
      id: entry.id,
      survey_id: entry.surveyId,
      label: entry.label,
      votes_count: entry.votesCount,
    })),
  );

  await insertRows(
    "survey_votes",
    store.surveyVotes.map((entry) => ({
      id: entry.id,
      survey_id: entry.surveyId,
      option_id: entry.optionId,
      user_id: entry.userId,
      created_at: entry.createdAt,
    })),
  );

  await insertRows(
    "alerts",
    store.alerts.map((entry) => ({
      id: entry.id,
      user_id: entry.userId,
      type: entry.type,
      title: entry.title,
      body: entry.body,
      link: entry.link,
      read_at: entry.readAt,
      created_at: entry.createdAt,
    })),
  );

  await insertRows(
    "saved_gists",
    store.savedGists.map((entry) => ({
      id: entry.id,
      user_id: entry.userId,
      gist_id: entry.gistId,
      created_at: entry.createdAt,
    })),
  );

  await insertRows(
    "contact_messages",
    store.contactOgaMessages.map((entry) => ({
      id: entry.id,
      sender_user_id: entry.senderUserId,
      sender_identity: entry.senderIdentity,
      account_code_reference: entry.accountCodeReference,
      category: entry.category,
      body: entry.body,
      status: entry.status,
      created_at: entry.createdAt,
      read_at: entry.readAt,
    })),
  );

  await insertRows(
    "intel_submissions",
    store.intelSubmissions.map((entry) => ({
      id: entry.id,
      contact_message_id: entry.contactMessageId,
      sender_user_id: entry.senderUserId,
      sender_identity: entry.senderIdentity,
      account_code_reference: entry.accountCodeReference,
      method: entry.method,
      urgency: entry.urgency,
      summary: entry.summary,
      body: entry.body,
      location_hint: entry.locationHint,
      linked_gist_reference: entry.linkedGistReference,
      status: entry.status,
      created_at: entry.createdAt,
      reviewed_at: entry.reviewedAt,
    })),
  );

  await insertRows(
    "pinned_gists",
    store.pinnedGists.map((entry) => ({
      gist_id: entry.gistId,
      priority: entry.priority,
      pinned_by_user_id: entry.pinnedByUserId,
      created_at: entry.createdAt,
      updated_at: entry.updatedAt,
    })),
  );

  await insertRows(
    "prediction_modules",
    store.predictionModules.map((entry) => ({
      id: entry.id,
      title: entry.title,
      body: entry.body,
      kicker: entry.kicker,
      status: entry.status,
      created_by_user_id: entry.createdByUserId,
      created_at: entry.createdAt,
    })),
  );

  await insertRows(
    "user_points_ledger",
    store.userPointsLedger.map((entry) => ({
      id: entry.id,
      user_id: entry.userId,
      event_type: entry.eventType,
      points_delta: entry.pointsDelta,
      metadata: entry.metadata,
      created_at: entry.createdAt,
    })),
  );

  await insertRows(
    "user_trust_profiles",
    store.userTrustProfiles.map((entry) => ({
      user_id: entry.userId,
      trust_score: entry.trustScore,
      personal_data_strikes: entry.personalDataStrikes,
      fake_location_strikes: entry.fakeLocationStrikes,
      valid_report_count: entry.validReportCount,
      invalid_report_count: entry.invalidReportCount,
      last_updated_at: entry.lastUpdatedAt,
    })),
  );

  await insertRows(
    "oga_actions",
    store.ogaActions.map((entry) => ({
      id: entry.id,
      oga_user_id: entry.ogaUserId,
      action_type: entry.actionType,
      target_type: entry.targetType,
      target_id: entry.targetId,
      notes: entry.notes,
      created_at: entry.createdAt,
    })),
  );

  await insertRows(
    "location_cache",
    store.locationCache.map((entry) => ({
      id: entry.id,
      display_locality: entry.displayLocality,
      area_bucket: entry.areaBucket,
      admin2_name: entry.admin2Name,
      admin2_type: entry.admin2Type,
      state_name: entry.stateName,
      confidence_score: entry.confidenceScore,
      provider: entry.provider,
      provider_ref: entry.providerRef,
      created_at: entry.createdAt,
      updated_at: entry.updatedAt,
    })),
  );
}

export async function mutateSupabaseRestStore<T>(
  operation: (store: AppStore) => Promise<T> | T,
) {
  const store = await loadSupabaseRestStore();
  const result = await operation(store);
  await replaceSupabaseRestStore(store);
  return result;
}
