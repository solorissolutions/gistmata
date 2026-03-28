create table if not exists intel_submissions (
  id text primary key,
  contact_message_id text not null unique references contact_messages(id) on delete cascade,
  sender_user_id text references users(id) on delete set null,
  sender_identity text not null,
  account_code_reference text,
  method text not null check (
    method in ('direct-witness', 'trusted-source', 'pattern-observed', 'existing-gist')
  ),
  urgency text not null default 'watch' check (urgency in ('routine', 'watch', 'urgent')),
  summary text not null,
  body text not null,
  location_hint text,
  linked_gist_reference text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'logged')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists idx_intel_submissions_status
  on intel_submissions(status, urgency, created_at desc);

alter table intel_submissions enable row level security;

drop policy if exists "service_role_all_intel_submissions" on intel_submissions;

create policy "service_role_all_intel_submissions"
  on intel_submissions
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
