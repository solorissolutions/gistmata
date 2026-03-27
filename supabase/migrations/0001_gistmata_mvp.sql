create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  username_normalized text not null unique,
  pin_hash text not null,
  account_code_hash text not null,
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
  referred_by_user_id uuid references users(id),
  referral_code_used text,
  created_at timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_seen_at timestamptz not null default now()
);

create table if not exists referral_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  created_by_user_id uuid not null references users(id),
  used_by_user_id uuid references users(id),
  used_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true
);

create table if not exists account_recovery_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  success boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists gists (
  id uuid primary key default gen_random_uuid(),
  author_user_id uuid not null references users(id),
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
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists gist_reactions (
  id uuid primary key default gen_random_uuid(),
  gist_id uuid not null references gists(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  type text not null,
  created_at timestamptz not null default now(),
  unique (gist_id, user_id)
);

create table if not exists gist_comments (
  id uuid primary key default gen_random_uuid(),
  gist_id uuid not null references gists(id) on delete cascade,
  author_user_id uuid not null references users(id) on delete cascade,
  body text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  parent_comment_id uuid references gist_comments(id)
);

create table if not exists gist_reports (
  id uuid primary key default gen_random_uuid(),
  gist_id uuid not null references gists(id) on delete cascade,
  reporter_user_id uuid not null references users(id) on delete cascade,
  type text not null,
  reason_text text,
  created_at timestamptz not null default now()
);

create table if not exists surveys (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  created_by_user_id uuid not null references users(id),
  scope_type text not null,
  scope_value text,
  status text not null default 'draft',
  pinned boolean not null default false,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  points_reward integer not null default 0
);

create table if not exists survey_options (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references surveys(id) on delete cascade,
  label text not null,
  votes_count integer not null default 0
);

create table if not exists survey_votes (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references surveys(id) on delete cascade,
  option_id uuid not null references survey_options(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (survey_id, user_id)
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  link text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists user_points_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  event_type text not null,
  points_delta integer not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists user_trust_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  trust_score integer not null default 70,
  personal_data_strikes integer not null default 0,
  fake_location_strikes integer not null default 0,
  valid_report_count integer not null default 0,
  invalid_report_count integer not null default 0,
  last_updated_at timestamptz not null default now()
);

create table if not exists oga_actions (
  id uuid primary key default gen_random_uuid(),
  oga_user_id uuid not null references users(id),
  action_type text not null,
  target_type text not null,
  target_id text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists location_cache (
  id uuid primary key default gen_random_uuid(),
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

create table if not exists feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text not null
);

create index if not exists idx_gists_state on gists(state_name, created_at desc);
create index if not exists idx_gists_area on gists(area_bucket, created_at desc);
create index if not exists idx_alerts_user on alerts(user_id, created_at desc);
create index if not exists idx_points_user on user_points_ledger(user_id, created_at desc);
