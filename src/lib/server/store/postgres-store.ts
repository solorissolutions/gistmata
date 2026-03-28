import { Pool, type PoolClient } from "pg";

import type { AppStore } from "@/lib/domain/types";

const STORE_LOCK_ID = 48_770_431;

let pool: Pool | null = null;

function getDatabaseConnectionString() {
  return (
    process.env.DIRECT_URL?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    null
  );
}

function shouldUseSsl(connectionString: string) {
  return /supabase\.co/i.test(connectionString) || /sslmode=require/i.test(connectionString);
}

export function isPostgresStoreConfigured() {
  return Boolean(getDatabaseConnectionString());
}

function getPool() {
  const connectionString = getDatabaseConnectionString();

  if (!connectionString) {
    throw new Error("DATABASE_URL or DIRECT_URL is required for the Postgres store.");
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      max: 4,
      allowExitOnIdle: true,
      ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
    });
  }

  return pool;
}

async function readJsonArray<T>(client: PoolClient, sql: string) {
  const result = await client.query<{ data: T[] }>(sql);
  return (result.rows[0]?.data ?? []) as T[];
}

async function assertSchemaReady(client: PoolClient) {
  const result = await client.query<{
    users_table: string | null;
    join_drafts_table: string | null;
    referral_activations_table: string | null;
    contact_messages_table: string | null;
    intel_submissions_table: string | null;
  }>(
    `select
      to_regclass('public.users') as users_table,
      to_regclass('public.join_drafts') as join_drafts_table,
      to_regclass('public.referral_activations') as referral_activations_table,
      to_regclass('public.contact_messages') as contact_messages_table,
      to_regclass('public.intel_submissions') as intel_submissions_table`,
  );
  const row = result.rows[0];

  if (
    !row?.users_table ||
    !row.join_drafts_table ||
    !row.referral_activations_table ||
    !row.contact_messages_table ||
    !row.intel_submissions_table
  ) {
    throw new Error(
      "Supabase schema is not ready. Run the semi-live migrations before starting the app.",
    );
  }
}

async function loadStoreWithClient(client: PoolClient): Promise<AppStore> {
  await assertSchemaReady(client);

  return {
    users: await readJsonArray(
      client,
      `select coalesce(json_agg(row_to_json(t)), '[]'::json) as data
       from (
         select
           id,
           username,
           username_normalized as "usernameNormalized",
           pin_hash as "pinHash",
           account_code_hash as "accountCodeHash",
           home_state as "homeState",
           age_range as "ageRange",
           gender,
           tier,
           points_balance as "pointsBalance",
           is_oga as "isOga",
           comot_tagged as "comotTagged",
           created_at as "createdAt",
           last_active_at as "lastActiveAt",
           home_area_display as "homeAreaDisplay",
           home_area_bucket as "homeAreaBucket",
           home_admin2_name as "homeAdmin2Name",
           home_admin2_type as "homeAdmin2Type",
           location_confidence as "locationConfidence",
           referred_by_user_id as "referredByUserId",
           referral_code_used as "referralCodeUsed",
           dev_recovery_code as "devRecoveryCode"
         from users
       ) t`,
    ),
    sessions: await readJsonArray(
      client,
      `select coalesce(json_agg(row_to_json(t)), '[]'::json) as data
       from (
         select
           id,
           user_id as "userId",
           token_hash as "tokenHash",
           created_at as "createdAt",
           expires_at as "expiresAt",
           last_seen_at as "lastSeenAt"
         from sessions
       ) t`,
    ),
    joinDrafts: await readJsonArray(
      client,
      `select coalesce(json_agg(row_to_json(t)), '[]'::json) as data
       from (
         select
           id,
           referral_code_id as "referralCodeId",
           referral_code as "referralCode",
           username,
           username_normalized as "usernameNormalized",
            pin_hash as "pinHash",
            account_code as "accountCode",
            account_code_hash as "accountCodeHash",
            state,
            age_range as "ageRange",
            gender,
            reserved_referral_codes as "reservedReferralCodes",
            created_at as "createdAt"
         from join_drafts
       ) t`,
    ),
    referralCodes: await readJsonArray(
      client,
      `select coalesce(json_agg(row_to_json(t)), '[]'::json) as data
       from (
         select
           id,
           code,
           created_by_user_id as "createdByUserId",
           used_by_user_id as "usedByUserId",
           used_at as "usedAt",
           created_at as "createdAt",
           expires_at as "expiresAt",
           is_active as "isActive"
         from referral_codes
       ) t`,
    ),
    referralActivations: await readJsonArray(
      client,
      `select coalesce(json_agg(row_to_json(t)), '[]'::json) as data
       from (
         select
           id,
           referral_code_id as "referralCodeId",
           referrer_user_id as "referrerUserId",
           referred_user_id as "referredUserId",
           points_awarded as "pointsAwarded",
           created_at as "createdAt"
         from referral_activations
       ) t`,
    ),
    accountRecoveryEvents: await readJsonArray(
      client,
      `select coalesce(json_agg(row_to_json(t)), '[]'::json) as data
       from (
         select
           id,
           user_id as "userId",
           success,
           created_at as "createdAt"
         from account_recovery_events
       ) t`,
    ),
    gists: await readJsonArray(
      client,
      `select coalesce(json_agg(row_to_json(t)), '[]'::json) as data
       from (
         select
           id,
           author_user_id as "authorUserId",
           body,
           tag,
           area_display as "areaDisplay",
           area_bucket as "areaBucket",
           admin2_name as "admin2Name",
           admin2_type as "admin2Type",
           state_name as "stateName",
           feed_visibility_score as "feedVisibilityScore",
           translation_text as "translationText",
           comments_count as "commentsCount",
           reactions_count as "reactionsCount",
           reports_count as "reportsCount",
           follow_up_count as "followUpCount",
           status,
           created_at as "createdAt"
         from gists
       ) t`,
    ),
    gistRelations: await readJsonArray(
      client,
      `select coalesce(json_agg(row_to_json(t)), '[]'::json) as data
       from (
         select
           id,
           child_gist_id as "childGistId",
           parent_gist_id as "parentGistId",
           relation_type as "relationType",
           created_at as "createdAt"
         from gist_relations
       ) t`,
    ),
    gistReactions: await readJsonArray(
      client,
      `select coalesce(json_agg(row_to_json(t)), '[]'::json) as data
       from (
         select
           id,
           gist_id as "gistId",
           user_id as "userId",
           type,
           created_at as "createdAt"
         from gist_reactions
       ) t`,
    ),
    gistComments: await readJsonArray(
      client,
      `select coalesce(json_agg(row_to_json(t)), '[]'::json) as data
       from (
         select
           id,
           gist_id as "gistId",
           author_user_id as "authorUserId",
           body,
           status,
           created_at as "createdAt",
           parent_comment_id as "parentCommentId"
         from gist_comments
       ) t`,
    ),
    gistReports: await readJsonArray(
      client,
      `select coalesce(json_agg(row_to_json(t)), '[]'::json) as data
       from (
         select
           id,
           gist_id as "gistId",
           reporter_user_id as "reporterUserId",
           type,
           reason_text as "reasonText",
           status,
           triaged_at as "triagedAt",
           resolved_at as "resolvedAt",
           resolved_by_oga_user_id as "resolvedByOgaUserId",
           resolution_notes as "resolutionNotes",
           created_at as "createdAt"
         from gist_reports
       ) t`,
    ),
    alerts: await readJsonArray(
      client,
      `select coalesce(json_agg(row_to_json(t)), '[]'::json) as data
       from (
         select
           id,
           user_id as "userId",
           type,
           title,
           body,
           link,
           read_at as "readAt",
           created_at as "createdAt"
         from alerts
       ) t`,
    ),
    savedGists: await readJsonArray(
      client,
      `select coalesce(json_agg(row_to_json(t)), '[]'::json) as data
       from (
         select
           id,
           user_id as "userId",
           gist_id as "gistId",
           created_at as "createdAt"
         from saved_gists
       ) t`,
    ),
    contactOgaMessages: await readJsonArray(
      client,
      `select coalesce(json_agg(row_to_json(t)), '[]'::json) as data
       from (
         select
           id,
           sender_user_id as "senderUserId",
           sender_identity as "senderIdentity",
           account_code_reference as "accountCodeReference",
           category,
           body,
           status,
           created_at as "createdAt",
           read_at as "readAt"
         from contact_messages
       ) t`,
    ),
    intelSubmissions: await readJsonArray(
      client,
      `select coalesce(json_agg(row_to_json(t)), '[]'::json) as data
       from (
         select
           id,
           contact_message_id as "contactMessageId",
           sender_user_id as "senderUserId",
           sender_identity as "senderIdentity",
           account_code_reference as "accountCodeReference",
           method,
           urgency,
           summary,
           body,
           location_hint as "locationHint",
           linked_gist_reference as "linkedGistReference",
           status,
           created_at as "createdAt",
           reviewed_at as "reviewedAt"
         from intel_submissions
       ) t`,
    ),
    pinnedGists: await readJsonArray(
      client,
      `select coalesce(json_agg(row_to_json(t)), '[]'::json) as data
       from (
         select
           gist_id as "gistId",
           priority,
           pinned_by_user_id as "pinnedByUserId",
           created_at as "createdAt",
           updated_at as "updatedAt"
         from pinned_gists
       ) t`,
    ),
    userPointsLedger: await readJsonArray(
      client,
      `select coalesce(json_agg(row_to_json(t)), '[]'::json) as data
       from (
         select
           id,
           user_id as "userId",
           event_type as "eventType",
           points_delta as "pointsDelta",
           metadata,
           created_at as "createdAt"
         from user_points_ledger
       ) t`,
    ),
    userTrustProfiles: await readJsonArray(
      client,
      `select coalesce(json_agg(row_to_json(t)), '[]'::json) as data
       from (
         select
           user_id as "userId",
           trust_score as "trustScore",
           personal_data_strikes as "personalDataStrikes",
           fake_location_strikes as "fakeLocationStrikes",
           valid_report_count as "validReportCount",
           invalid_report_count as "invalidReportCount",
           last_updated_at as "lastUpdatedAt"
         from user_trust_profiles
       ) t`,
    ),
    ogaActions: await readJsonArray(
      client,
      `select coalesce(json_agg(row_to_json(t)), '[]'::json) as data
       from (
         select
           id,
           oga_user_id as "ogaUserId",
           action_type as "actionType",
           target_type as "targetType",
           target_id as "targetId",
           notes,
           created_at as "createdAt"
         from oga_actions
       ) t`,
    ),
    locationCache: await readJsonArray(
      client,
      `select coalesce(json_agg(row_to_json(t)), '[]'::json) as data
       from (
         select
           id,
           display_locality as "displayLocality",
           area_bucket as "areaBucket",
           admin2_name as "admin2Name",
           admin2_type as "admin2Type",
           state_name as "stateName",
           confidence_score as "confidenceScore",
           provider,
           provider_ref as "providerRef",
           created_at as "createdAt",
           updated_at as "updatedAt"
         from location_cache
       ) t`,
    ),
    featureFlags: await readJsonArray(
      client,
      `select coalesce(json_agg(row_to_json(t)), '[]'::json) as data
       from (
         select
           key,
           enabled,
           description
         from feature_flags
       ) t`,
    ),
  };
}

async function insertJsonRows(
  client: PoolClient,
  sql: string,
  rows: unknown[],
) {
  await client.query(sql, [JSON.stringify(rows)]);
}

async function writeStoreWithClient(client: PoolClient, store: AppStore) {
  await assertSchemaReady(client);

  await client.query(
    `truncate table
      account_recovery_events,
      alerts,
      contact_messages,
      intel_submissions,
      gist_comments,
      gist_reactions,
      gist_relations,
      gist_reports,
      join_drafts,
      location_cache,
      oga_actions,
      pinned_gists,
      saved_gists,
      sessions,
      user_points_ledger,
      user_trust_profiles,
      referral_activations,
      referral_codes,
      gists,
      feature_flags,
      users
    cascade`,
  );

  await insertJsonRows(
    client,
    `insert into users (
      id, username, username_normalized, pin_hash, account_code_hash, home_state,
      age_range, gender, tier, points_balance, is_oga, comot_tagged, created_at,
      last_active_at, home_area_display, home_area_bucket, home_admin2_name,
      home_admin2_type, location_confidence, referred_by_user_id, referral_code_used,
      dev_recovery_code
    )
    select
      id, username, "usernameNormalized", "pinHash", "accountCodeHash", "homeState",
      "ageRange", gender, tier, "pointsBalance", "isOga", "comotTagged", "createdAt",
      "lastActiveAt", "homeAreaDisplay", "homeAreaBucket", "homeAdmin2Name",
      "homeAdmin2Type", "locationConfidence", "referredByUserId", "referralCodeUsed",
      "devRecoveryCode"
    from jsonb_to_recordset($1::jsonb) as x(
      id text,
      username text,
      "usernameNormalized" text,
      "pinHash" text,
      "accountCodeHash" text,
      "homeState" text,
      "ageRange" text,
      gender text,
      tier text,
      "pointsBalance" integer,
      "isOga" boolean,
      "comotTagged" boolean,
      "createdAt" timestamptz,
      "lastActiveAt" timestamptz,
      "homeAreaDisplay" text,
      "homeAreaBucket" text,
      "homeAdmin2Name" text,
      "homeAdmin2Type" text,
      "locationConfidence" numeric,
      "referredByUserId" text,
      "referralCodeUsed" text,
      "devRecoveryCode" text
    )`,
    store.users,
  );

  await insertJsonRows(
    client,
    `insert into feature_flags (key, enabled, description)
     select key, enabled, description
     from jsonb_to_recordset($1::jsonb) as x(
       key text,
       enabled boolean,
       description text
     )`,
    store.featureFlags,
  );

  await insertJsonRows(
    client,
    `insert into referral_codes (
      id, code, created_by_user_id, used_by_user_id, used_at, created_at, expires_at, is_active
    )
    select
      id, code, "createdByUserId", "usedByUserId", "usedAt", "createdAt", "expiresAt", "isActive"
    from jsonb_to_recordset($1::jsonb) as x(
      id text,
      code text,
      "createdByUserId" text,
      "usedByUserId" text,
      "usedAt" timestamptz,
      "createdAt" timestamptz,
      "expiresAt" timestamptz,
      "isActive" boolean
    )`,
    store.referralCodes,
  );

  await insertJsonRows(
    client,
    `insert into referral_activations (
      id, referral_code_id, referrer_user_id, referred_user_id, points_awarded, created_at
    )
    select
      id, "referralCodeId", "referrerUserId", "referredUserId", "pointsAwarded", "createdAt"
    from jsonb_to_recordset($1::jsonb) as x(
      id text,
      "referralCodeId" text,
      "referrerUserId" text,
      "referredUserId" text,
      "pointsAwarded" integer,
      "createdAt" timestamptz
    )`,
    store.referralActivations,
  );

  await insertJsonRows(
    client,
    `insert into join_drafts (
      id, referral_code_id, referral_code, username, username_normalized, pin_hash,
      account_code, account_code_hash, state, age_range, gender, reserved_referral_codes, created_at
    )
    select
      id, "referralCodeId", "referralCode", username, "usernameNormalized", "pinHash",
      "accountCode", "accountCodeHash", state, "ageRange", gender, "reservedReferralCodes", "createdAt"
    from jsonb_to_recordset($1::jsonb) as x(
      id text,
      "referralCodeId" text,
      "referralCode" text,
      username text,
      "usernameNormalized" text,
      "pinHash" text,
      "accountCode" text,
      "accountCodeHash" text,
      state text,
      "ageRange" text,
      gender text,
      "reservedReferralCodes" jsonb,
      "createdAt" timestamptz
    )`,
    store.joinDrafts,
  );

  await insertJsonRows(
    client,
    `insert into sessions (
      id, user_id, token_hash, created_at, expires_at, last_seen_at
    )
    select
      id, "userId", "tokenHash", "createdAt", "expiresAt", "lastSeenAt"
    from jsonb_to_recordset($1::jsonb) as x(
      id text,
      "userId" text,
      "tokenHash" text,
      "createdAt" timestamptz,
      "expiresAt" timestamptz,
      "lastSeenAt" timestamptz
    )`,
    store.sessions,
  );

  await insertJsonRows(
    client,
    `insert into account_recovery_events (id, user_id, success, created_at)
     select id, "userId", success, "createdAt"
     from jsonb_to_recordset($1::jsonb) as x(
       id text,
       "userId" text,
       success boolean,
       "createdAt" timestamptz
     )`,
    store.accountRecoveryEvents,
  );

  await insertJsonRows(
    client,
    `insert into gists (
      id, author_user_id, body, tag, area_display, area_bucket, admin2_name,
      admin2_type, state_name, feed_visibility_score, translation_text, comments_count,
      reactions_count, reports_count, follow_up_count, status, created_at
    )
    select
      id, "authorUserId", body, tag, "areaDisplay", "areaBucket", "admin2Name",
      "admin2Type", "stateName", "feedVisibilityScore", "translationText", "commentsCount",
      "reactionsCount", "reportsCount", "followUpCount", status, "createdAt"
    from jsonb_to_recordset($1::jsonb) as x(
      id text,
      "authorUserId" text,
      body text,
      tag text,
      "areaDisplay" text,
      "areaBucket" text,
      "admin2Name" text,
      "admin2Type" text,
      "stateName" text,
      "feedVisibilityScore" numeric,
      "translationText" text,
      "commentsCount" integer,
      "reactionsCount" integer,
      "reportsCount" integer,
      "followUpCount" integer,
      status text,
      "createdAt" timestamptz
    )`,
    store.gists,
  );

  await insertJsonRows(
    client,
    `insert into gist_relations (
      id, child_gist_id, parent_gist_id, relation_type, created_at
    )
    select id, "childGistId", "parentGistId", "relationType", "createdAt"
    from jsonb_to_recordset($1::jsonb) as x(
      id text,
      "childGistId" text,
      "parentGistId" text,
      "relationType" text,
      "createdAt" timestamptz
    )`,
    store.gistRelations,
  );

  await insertJsonRows(
    client,
    `insert into gist_reactions (id, gist_id, user_id, type, created_at)
     select id, "gistId", "userId", type, "createdAt"
     from jsonb_to_recordset($1::jsonb) as x(
       id text,
       "gistId" text,
       "userId" text,
       type text,
       "createdAt" timestamptz
     )`,
    store.gistReactions,
  );

  await insertJsonRows(
    client,
    `insert into gist_comments (
      id, gist_id, author_user_id, body, status, created_at, parent_comment_id
    )
    select
      id, "gistId", "authorUserId", body, status, "createdAt", "parentCommentId"
    from jsonb_to_recordset($1::jsonb) as x(
      id text,
      "gistId" text,
      "authorUserId" text,
      body text,
      status text,
      "createdAt" timestamptz,
      "parentCommentId" text
    )`,
    store.gistComments,
  );

  await insertJsonRows(
    client,
    `insert into gist_reports (
      id, gist_id, reporter_user_id, type, reason_text, status, triaged_at,
      resolved_at, resolved_by_oga_user_id, resolution_notes, created_at
    )
    select
      id, "gistId", "reporterUserId", type, "reasonText",
      coalesce(status, 'open'), "triagedAt", "resolvedAt", "resolvedByOgaUserId",
      "resolutionNotes", "createdAt"
    from jsonb_to_recordset($1::jsonb) as x(
      id text,
      "gistId" text,
      "reporterUserId" text,
      type text,
      "reasonText" text,
      status text,
      "triagedAt" timestamptz,
      "resolvedAt" timestamptz,
      "resolvedByOgaUserId" text,
      "resolutionNotes" text,
      "createdAt" timestamptz
    )`,
    store.gistReports,
  );

  await insertJsonRows(
    client,
    `insert into alerts (id, user_id, type, title, body, link, read_at, created_at)
     select id, "userId", type, title, body, link, "readAt", "createdAt"
     from jsonb_to_recordset($1::jsonb) as x(
       id text,
       "userId" text,
       type text,
       title text,
       body text,
       link text,
       "readAt" timestamptz,
       "createdAt" timestamptz
     )`,
    store.alerts,
  );

  await insertJsonRows(
    client,
    `insert into saved_gists (id, user_id, gist_id, created_at)
     select id, "userId", "gistId", "createdAt"
     from jsonb_to_recordset($1::jsonb) as x(
       id text,
       "userId" text,
       "gistId" text,
       "createdAt" timestamptz
     )`,
    store.savedGists,
  );

  await insertJsonRows(
    client,
    `insert into contact_messages (
      id, sender_user_id, sender_identity, account_code_reference, category, body,
      status, created_at, read_at
    )
    select
      id, "senderUserId", "senderIdentity", "accountCodeReference", category, body,
      status, "createdAt", "readAt"
    from jsonb_to_recordset($1::jsonb) as x(
      id text,
      "senderUserId" text,
      "senderIdentity" text,
      "accountCodeReference" text,
      category text,
      body text,
      status text,
      "createdAt" timestamptz,
      "readAt" timestamptz
    )`,
    store.contactOgaMessages,
  );

  await insertJsonRows(
    client,
    `insert into intel_submissions (
      id, contact_message_id, sender_user_id, sender_identity, account_code_reference,
      method, urgency, summary, body, location_hint, linked_gist_reference, status,
      created_at, reviewed_at
    )
    select
      id, "contactMessageId", "senderUserId", "senderIdentity", "accountCodeReference",
      method, urgency, summary, body, "locationHint", "linkedGistReference", status,
      "createdAt", "reviewedAt"
    from jsonb_to_recordset($1::jsonb) as x(
      id text,
      "contactMessageId" text,
      "senderUserId" text,
      "senderIdentity" text,
      "accountCodeReference" text,
      method text,
      urgency text,
      summary text,
      body text,
      "locationHint" text,
      "linkedGistReference" text,
      status text,
      "createdAt" timestamptz,
      "reviewedAt" timestamptz
    )`,
    store.intelSubmissions,
  );

  await insertJsonRows(
    client,
    `insert into pinned_gists (
      gist_id, priority, pinned_by_user_id, created_at, updated_at
    )
    select
      "gistId", priority, "pinnedByUserId", "createdAt", "updatedAt"
    from jsonb_to_recordset($1::jsonb) as x(
      "gistId" text,
      priority integer,
      "pinnedByUserId" text,
      "createdAt" timestamptz,
      "updatedAt" timestamptz
    )`,
    store.pinnedGists,
  );

  await insertJsonRows(
    client,
    `insert into user_points_ledger (
      id, user_id, event_type, points_delta, metadata, created_at
    )
    select
      id, "userId", "eventType", "pointsDelta", metadata, "createdAt"
    from jsonb_to_recordset($1::jsonb) as x(
      id text,
      "userId" text,
      "eventType" text,
      "pointsDelta" integer,
      metadata jsonb,
      "createdAt" timestamptz
    )`,
    store.userPointsLedger,
  );

  await insertJsonRows(
    client,
    `insert into user_trust_profiles (
      user_id, trust_score, personal_data_strikes, fake_location_strikes,
      valid_report_count, invalid_report_count, last_updated_at
    )
    select
      "userId", "trustScore", "personalDataStrikes", "fakeLocationStrikes",
      "validReportCount", "invalidReportCount", "lastUpdatedAt"
    from jsonb_to_recordset($1::jsonb) as x(
      "userId" text,
      "trustScore" integer,
      "personalDataStrikes" integer,
      "fakeLocationStrikes" integer,
      "validReportCount" integer,
      "invalidReportCount" integer,
      "lastUpdatedAt" timestamptz
    )`,
    store.userTrustProfiles,
  );

  await insertJsonRows(
    client,
    `insert into oga_actions (
      id, oga_user_id, action_type, target_type, target_id, notes, created_at
    )
    select
      id, "ogaUserId", "actionType", "targetType", "targetId", notes, "createdAt"
    from jsonb_to_recordset($1::jsonb) as x(
      id text,
      "ogaUserId" text,
      "actionType" text,
      "targetType" text,
      "targetId" text,
      notes text,
      "createdAt" timestamptz
    )`,
    store.ogaActions,
  );

  await insertJsonRows(
    client,
    `insert into location_cache (
      id, display_locality, area_bucket, admin2_name, admin2_type, state_name,
      confidence_score, provider, provider_ref, created_at, updated_at
    )
    select
      id, "displayLocality", "areaBucket", "admin2Name", "admin2Type", "stateName",
      "confidenceScore", provider, "providerRef", "createdAt", "updatedAt"
    from jsonb_to_recordset($1::jsonb) as x(
      id text,
      "displayLocality" text,
      "areaBucket" text,
      "admin2Name" text,
      "admin2Type" text,
      "stateName" text,
      "confidenceScore" numeric,
      provider text,
      "providerRef" text,
      "createdAt" timestamptz,
      "updatedAt" timestamptz
    )`,
    store.locationCache,
  );
}

export async function loadPostgresStore() {
  const client = await getPool().connect();

  try {
    return await loadStoreWithClient(client);
  } finally {
    client.release();
  }
}

export async function replacePostgresStore(store: AppStore) {
  const client = await getPool().connect();

  try {
    await client.query("begin");
    await client.query("select pg_advisory_xact_lock($1)", [STORE_LOCK_ID]);
    await writeStoreWithClient(client, store);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function mutatePostgresStore<T>(
  operation: (store: AppStore) => Promise<T> | T,
) {
  const client = await getPool().connect();

  try {
    await client.query("begin");
    await client.query("select pg_advisory_xact_lock($1)", [STORE_LOCK_ID]);
    const store = await loadStoreWithClient(client);
    const result = await operation(store);
    await writeStoreWithClient(client, store);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
