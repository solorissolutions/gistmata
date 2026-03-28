drop table if exists survey_votes cascade;
drop table if exists survey_options cascade;
drop table if exists surveys cascade;
drop table if exists prediction_modules cascade;

alter table if exists join_drafts
  add column if not exists reserved_referral_codes jsonb not null default '[]'::jsonb;

alter table if exists referral_codes
  add column if not exists created_at timestamptz not null default now();

alter table if exists alerts
  drop constraint if exists alerts_type_check;

alter table if exists alerts
  add constraint alerts_type_check
  check (type in ('comment', 'activity', 'points', 'account'));

create table if not exists referral_activations (
  id text primary key,
  referral_code_id text not null references referral_codes(id) on delete cascade,
  referrer_user_id text not null references users(id) on delete cascade,
  referred_user_id text not null unique references users(id) on delete cascade,
  points_awarded integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_referral_activations_referrer
  on referral_activations(referrer_user_id, created_at desc);

create index if not exists idx_referral_activations_created_at
  on referral_activations(created_at desc);

create index if not exists idx_referral_codes_created_at
  on referral_codes(created_at desc);

alter table if exists referral_activations enable row level security;

drop policy if exists "service_role_all_referral_activations" on referral_activations;

create policy "service_role_all_referral_activations"
  on referral_activations
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
