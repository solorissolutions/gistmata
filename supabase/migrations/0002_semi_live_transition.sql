create extension if not exists pgcrypto;

drop table if exists survey_votes cascade;
drop table if exists survey_options cascade;
drop table if exists surveys cascade;
drop table if exists gist_reactions cascade;
drop table if exists gist_comments cascade;
drop table if exists gist_reports cascade;
drop table if exists gist_relations cascade;
drop table if exists saved_gists cascade;
drop table if exists pinned_gists cascade;
drop table if exists alerts cascade;
drop table if exists contact_messages cascade;
drop table if exists prediction_modules cascade;
drop table if exists user_points_ledger cascade;
drop table if exists user_trust_profiles cascade;
drop table if exists oga_actions cascade;
drop table if exists location_cache cascade;
drop table if exists sessions cascade;
drop table if exists join_drafts cascade;
drop table if exists account_recovery_events cascade;
drop table if exists referral_codes cascade;
drop table if exists gists cascade;
drop table if exists feature_flags cascade;
drop table if exists users cascade;

create table users (
  id text primary key,
  username text not null unique,
  username_normalized text not null unique,
  pin_hash text not null,
  account_code_hash text not null,
  dev_recovery_code text,
  home_state text not null,
  home_area_display text,
  home_area_bucket text,
  home_admin2_name text,
  home_admin2_type text,
  location_confidence numeric,
  age_range text not null,
  gender text not null,
  tier text not null default 'New Member',
  points_balance integer not null default 0,
  is_oga boolean not null default false,
  comot_tagged boolean not null default false,
  referred_by_user_id text references users(id),
  referral_code_used text,
  created_at timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);

create table feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text not null
);

create table referral_codes (
  id text primary key,
  code text not null unique,
  created_by_user_id text not null references users(id),
  used_by_user_id text references users(id),
  used_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true
);

create table join_drafts (
  id text primary key,
  referral_code_id text not null references referral_codes(id) on delete cascade,
  referral_code text not null,
  username text,
  username_normalized text,
  pin_hash text,
  account_code text,
  account_code_hash text,
  state text,
  age_range text,
  gender text,
  created_at timestamptz not null default now()
);

create table sessions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_seen_at timestamptz not null default now()
);

create table account_recovery_events (
  id text primary key,
  user_id text references users(id) on delete set null,
  success boolean not null default false,
  created_at timestamptz not null default now()
);

create table gists (
  id text primary key,
  author_user_id text not null references users(id) on delete cascade,
  body text not null check (char_length(body) <= 350),
  tag text not null,
  area_display text not null,
  area_bucket text not null,
  admin2_name text not null,
  admin2_type text not null,
  state_name text not null,
  feed_visibility_score numeric not null default 0,
  translation_text text,
  comments_count integer not null default 0,
  reactions_count integer not null default 0,
  reports_count integer not null default 0,
  follow_up_count integer not null default 0,
  status text not null default 'active' check (status in ('active', 'removed')),
  created_at timestamptz not null default now()
);

create table gist_relations (
  id text primary key,
  child_gist_id text not null unique references gists(id) on delete cascade,
  parent_gist_id text not null references gists(id) on delete cascade,
  relation_type text not null check (
    relation_type in ('follow-up', 'update', 'confirm', 'counter', 'same-for-my-side')
  ),
  created_at timestamptz not null default now()
);

create table gist_reactions (
  id text primary key,
  gist_id text not null references gists(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  type text not null check (type in ('wahala', 'omo', 'sharp')),
  created_at timestamptz not null default now(),
  unique (gist_id, user_id)
);

create table gist_comments (
  id text primary key,
  gist_id text not null references gists(id) on delete cascade,
  author_user_id text not null references users(id) on delete cascade,
  body text not null,
  status text not null default 'active' check (status in ('active', 'removed')),
  created_at timestamptz not null default now(),
  parent_comment_id text references gist_comments(id) on delete set null
);

create table gist_reports (
  id text primary key,
  gist_id text not null references gists(id) on delete cascade,
  reporter_user_id text not null references users(id) on delete cascade,
  type text not null check (type in ('general', 'personal-data', 'fake-location')),
  reason_text text,
  status text not null default 'open' check (status in ('open', 'triaged', 'resolved', 'invalid')),
  triaged_at timestamptz,
  resolved_at timestamptz,
  resolved_by_oga_user_id text references users(id) on delete set null,
  resolution_notes text,
  created_at timestamptz not null default now()
);

create table surveys (
  id text primary key,
  question text not null,
  created_by_user_id text not null references users(id),
  scope_type text not null check (scope_type in ('nigeria', 'state', 'area')),
  scope_value text,
  status text not null default 'draft' check (status in ('draft', 'live', 'closed')),
  pinned boolean not null default false,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  points_reward integer not null default 0,
  constraint survey_scope_value_required
    check (
      (scope_type = 'nigeria' and scope_value is null)
      or (scope_type in ('state', 'area') and scope_value is not null)
    )
);

create table survey_options (
  id text primary key,
  survey_id text not null references surveys(id) on delete cascade,
  label text not null,
  votes_count integer not null default 0
);

create table survey_votes (
  id text primary key,
  survey_id text not null references surveys(id) on delete cascade,
  option_id text not null references survey_options(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (survey_id, user_id)
);

create table alerts (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  type text not null check (type in ('comment', 'activity', 'survey', 'points', 'account')),
  title text not null,
  body text not null,
  link text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table saved_gists (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  gist_id text not null references gists(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, gist_id)
);

create table contact_messages (
  id text primary key,
  sender_user_id text references users(id) on delete set null,
  sender_identity text not null,
  account_code_reference text,
  category text,
  body text not null,
  status text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table pinned_gists (
  gist_id text primary key references gists(id) on delete cascade,
  priority integer not null unique check (priority in (1, 2, 3)),
  pinned_by_user_id text not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table prediction_modules (
  id text primary key,
  title text not null,
  body text not null,
  kicker text not null,
  status text not null check (status in ('draft', 'live', 'closed')),
  created_by_user_id text not null references users(id),
  created_at timestamptz not null default now()
);

create table user_points_ledger (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  event_type text not null,
  points_delta integer not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table user_trust_profiles (
  user_id text primary key references users(id) on delete cascade,
  trust_score integer not null default 70,
  personal_data_strikes integer not null default 0,
  fake_location_strikes integer not null default 0,
  valid_report_count integer not null default 0,
  invalid_report_count integer not null default 0,
  last_updated_at timestamptz not null default now()
);

create table oga_actions (
  id text primary key,
  oga_user_id text not null references users(id),
  action_type text not null,
  target_type text not null,
  target_id text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table location_cache (
  id text primary key,
  display_locality text not null,
  area_bucket text not null,
  admin2_name text not null,
  admin2_type text not null,
  state_name text not null,
  confidence_score numeric not null,
  provider text not null,
  provider_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_gists_state on gists(state_name, created_at desc);
create index idx_gists_area on gists(area_bucket, created_at desc);
create index idx_gists_author on gists(author_user_id, created_at desc);
create index idx_alerts_user on alerts(user_id, created_at desc);
create index idx_points_user on user_points_ledger(user_id, created_at desc);
create index idx_reports_status on gist_reports(status, created_at desc);
create index idx_contact_messages_status on contact_messages(status, created_at desc);
create index idx_referral_codes_created_by on referral_codes(created_by_user_id);
create index idx_sessions_user on sessions(user_id, expires_at desc);
create index idx_surveys_pinned_live on surveys(pinned, status, ends_at desc);

alter table users enable row level security;
alter table feature_flags enable row level security;
alter table referral_codes enable row level security;
alter table join_drafts enable row level security;
alter table sessions enable row level security;
alter table account_recovery_events enable row level security;
alter table gists enable row level security;
alter table gist_relations enable row level security;
alter table gist_reactions enable row level security;
alter table gist_comments enable row level security;
alter table gist_reports enable row level security;
alter table surveys enable row level security;
alter table survey_options enable row level security;
alter table survey_votes enable row level security;
alter table alerts enable row level security;
alter table saved_gists enable row level security;
alter table contact_messages enable row level security;
alter table pinned_gists enable row level security;
alter table prediction_modules enable row level security;
alter table user_points_ledger enable row level security;
alter table user_trust_profiles enable row level security;
alter table oga_actions enable row level security;
alter table location_cache enable row level security;

create policy "service_role_all_users" on users for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_all_feature_flags" on feature_flags for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_all_referral_codes" on referral_codes for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_all_join_drafts" on join_drafts for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_all_sessions" on sessions for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_all_account_recovery_events" on account_recovery_events for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_all_gists" on gists for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_all_gist_relations" on gist_relations for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_all_gist_reactions" on gist_reactions for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_all_gist_comments" on gist_comments for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_all_gist_reports" on gist_reports for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_all_surveys" on surveys for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_all_survey_options" on survey_options for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_all_survey_votes" on survey_votes for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_all_alerts" on alerts for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_all_saved_gists" on saved_gists for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_all_contact_messages" on contact_messages for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_all_pinned_gists" on pinned_gists for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_all_prediction_modules" on prediction_modules for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_all_user_points_ledger" on user_points_ledger for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_all_user_trust_profiles" on user_trust_profiles for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_all_oga_actions" on oga_actions for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service_role_all_location_cache" on location_cache for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "public_read_active_gists" on gists for select using (status = 'active');
create policy "public_read_gist_relations" on gist_relations for select using (true);
create policy "public_read_active_gist_comments" on gist_comments for select using (status = 'active');
create policy "public_read_live_surveys" on surveys for select using (true);
create policy "public_read_survey_options" on survey_options for select using (true);
create policy "public_read_pinned_gists" on pinned_gists for select using (true);
create policy "public_read_feature_flags" on feature_flags for select using (true);
create policy "public_read_prediction_modules" on prediction_modules for select using (true);
