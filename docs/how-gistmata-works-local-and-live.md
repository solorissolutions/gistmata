# How GistMata Works: Local and Live

This document explains the **current** GistMata system as it actually works now.

It covers:

- the public app
- the standalone operator app
- shared backend truth
- local development
- live deployment
- auth and session behavior
- main user and operator flows
- validation and operational safety rules

This is the best single-file guide for understanding how the whole app fits together.

## 1. System Shape

GistMata currently runs as a **split deployment** with one shared backend truth.

### Public surface

- App source: repo root
- Local URL: `http://localhost:3000`
- Live target: `https://gistmata.com`
- Responsibility: public product experience

### Operator surface

- App source: `apps/oga`
- Local URL: `http://localhost:3001`
- Live testing target: `https://oga.gistmata.vercel.app`
- Final live target: `https://oga.gistmata.com`
- Responsibility: operator control room

### Shared backend truth

- Primary runtime truth: Supabase/Postgres
- Shared code: `src/lib/server`
- Shared services: `src/lib/server/services`
- Shared repositories: `src/lib/server/repositories`
- Shared store adapter: `src/lib/server/store`

Both the public app and the operator app read and write the **same product state**.

That means:

- a gist pinned by oga shows up in the public product
- a removed gist disappears from the public product
- a live survey created by oga appears in the public product
- a contact message from the public app appears in the operator inbox
- score, referrals, comments, saves, reports, and alerts all use the same backend truth

## 2. Monorepo Layout

```text
repo root
├─ src/
│  ├─ app/                    # public app routes
│  ├─ components/             # shared UI
│  └─ lib/
│     ├─ domain/              # product types, validation, constants, ranking rules
│     ├─ contracts/           # service-layer contracts
│     └─ server/
│        ├─ auth/             # session + access rules
│        ├─ repositories/     # persistence adapters
│        ├─ services/         # shared business logic
│        ├─ store/            # runtime store adapters
│        └─ operator-app.ts   # public→operator destination helpers
├─ apps/
│  └─ oga/
│     ├─ app/                 # standalone operator routes
│     ├─ components/          # operator-specific UI wrappers
│     └─ lib/                 # operator auth actions and guards
├─ docs/
├─ scripts/
└─ supabase/
   └─ migrations/
```

## 3. Architecture Rule

The app follows this practical layering rule:

- **Pages render**
- **Services decide**
- **Repositories fetch/store**
- **Postgres holds truth**

### What that means in practice

- `src/app` and `apps/oga/app` define route entrypoints and page orchestration
- `src/lib/server/services/*` owns product logic and workflow decisions
- `src/lib/server/repositories/*` adapts services to persistence primitives
- `src/lib/server/store/*` holds the runtime data access seam to Postgres

Important current note:

- `src/lib/server/store/index.ts` still contains a large amount of mixed persistence and business logic
- `src/lib/server/oga-v2.ts` still builds a large operator snapshot directly from the store
- those are transitional seams, but they still drive the same shared backend truth for both apps

## 4. Runtime Truth and Persistence

GistMata is now meant to run against **Postgres-backed state**, not file-backed demo state.

### Current runtime rule

If `DIRECT_URL` or `DATABASE_URL` is configured, the app uses:

- `src/lib/server/store/postgres-store.ts`

If database connection strings are missing:

- runtime falls back only in **tests**
- non-test app execution should fail

### Important consequence

Local app usage now needs a database connection.

This is no longer a “just run the demo without a database” setup.

### Main product entities

The runtime store maps to product truth such as:

- `users`
- `sessions`
- `join_drafts`
- `referral_codes`
- `account_recovery_events`
- `gists`
- `gist_relations`
- `gist_comments`
- `gist_reactions`
- `gist_reports`
- `surveys`
- `survey_options`
- `survey_votes`
- `saved_gists`
- `contact_messages`
- `intel_submissions`
- `pinned_gists`
- `alerts`
- `user_points_ledger`
- `user_trust_profiles`
- `oga_actions`
- `location_cache`
- `feature_flags`

## 5. Auth Model

GistMata does **not** use Supabase Auth for end-user login.

It uses a custom DB-backed auth model:

- username + PIN login
- Account Code + PIN recovery
- session cookie stored by the app itself
- OGA access decided by the `isOga` flag on the user record

### Important files

- `src/lib/server/auth/session.ts`
- `src/lib/server/auth/access.ts`
- `src/lib/server/services/auth/index.ts`
- `src/lib/server/repositories/auth-repository.ts`

### Session behavior

The app sets an HTTP-only cookie using `SESSION_COOKIE_NAME`.

Cookie behavior:

- `httpOnly: true`
- `sameSite: lax`
- `secure: true` in production
- `maxAge: 30 days`

### OGA account

The canonical OGA account is managed in the shared database.

Use:

```bash
npm run oga:ensure -- --check
```

If repair is needed:

```bash
npm run oga:ensure
```

This ensures:

- exactly one canonical `oga` user
- correct OGA PIN hash
- correct OGA account code hash
- smoke login works

## 6. Public App Flow

The public app is the main user-facing product.

### Main public areas

- `/`
- `/join`
- `/join/username`
- `/join/pin`
- `/join/account-code`
- `/join/basics`
- `/join/rules`
- `/login`
- `/locker/recovery`
- `/mata`
- `/mata/[level]`
- `/gist/[id]`
- `/drop`
- `/drop/follow-up/[parentId]`
- `/alerts`
- `/score`
- `/score/leaderboard`
- `/score/tiers`
- `/locker`
- `/locker/my-gists`
- `/locker/referrals`
- `/locker/saved`
- `/locker/privacy`
- `/locker/settings`
- `/contact-oga`
- `/judgement-day/[id]`

### Core public flow sequence

#### Join

1. User enters a referral code
2. User reserves a username
3. User sets a 6-digit PIN
4. System generates an Account Code
5. User completes basics
6. User accepts join rules
7. App creates a session and sends the user into Mata

#### Login

1. User enters username + PIN
2. App verifies against `users`
3. App creates a session record in `sessions`
4. App sets the session cookie
5. App redirects to `/mata`, or to the operator destination if the user is OGA

#### Recovery

1. User enters Account Code + PIN
2. App verifies hashed values against the user record
3. App records the recovery attempt in `account_recovery_events`
4. App creates a fresh session
5. App redirects to `/mata`, or to the operator destination if the user is OGA

#### Mata / feed

The feed is geography-first, not follower-first.

Main levels are:

- My Street
- My Area
- State
- Nigeria
- Hot

The feed reads active gists, rankings, trust context, pinned items, surveys, and alerts from shared DB truth.

#### Gist actions

Users can:

- drop a gist
- create a follow-up gist
- comment
- react
- save / unsave
- report

These all persist into the shared DB-backed store.

#### Judgement Day

Users can:

- view a live survey
- vote once
- earn points where applicable

#### Contact oga

Users can send:

- general messages
- suggestions
- issue reports
- intel-style submissions

Those flow into:

- `contact_messages`
- `intel_submissions` when applicable

#### Score / locker

The public app reads:

- current tier
- points balance
- leaderboard bundles
- saved gists
- referral status
- user trust summaries

Locker is utility space, not a public profile.

## 7. Operator App Flow

The operator app is a standalone Next.js deployment in `apps/oga`.

### Operator entrypoints

- `/login`
- `/recovery`
- `/oga-v2`

Compatibility aliases also exist inside the operator app:

- `/oga-login`
- `/locker/recovery`

### Main operator sections

- `/oga-v2` — overview / pulse
- `/oga-v2/intel`
- `/oga-v2/mata`
- `/oga-v2/matters`
- `/oga-v2/trust`
- `/oga-v2/users`
- `/oga-v2/judgement-day`
- `/oga-v2/growth`
- `/oga-v2/inbox`
- `/oga-v2/broadcast`
- `/oga-v2/location`
- `/oga-v2/settings`

### What oga can do

OGA reads and mutates the same product truth as the public app.

Typical actions include:

- inspect matters and gist chains
- pin / unpin gists
- remove / restore gists
- create / publish / close surveys
- review inbox messages and intel
- inspect growth and referral metrics
- inspect users and trust state
- send broadcasts
- inspect location confidence and suspicious assignments

### Operator route protection

OGA access is determined by:

- session cookie
- `getCurrentUser()`
- `evaluateOgaAccess()`
- `viewer.isOga`

If the viewer is not authenticated or is not OGA, the operator routes redirect away.

## 8. How Public and Operator Apps Connect

The public app and operator app are separate deployments, but they share the same backend and logic.

### Shared code

Both apps use shared code from:

- `src/lib/domain`
- `src/lib/server/services`
- `src/lib/server/repositories`
- `src/lib/server/store`
- shared UI primitives in `src/components`

### Redirect seam

The public app uses `OGA_APP_ORIGIN` to decide whether operator traffic should stay local or redirect to the standalone operator deployment.

Important files:

- `next.config.ts`
- `src/lib/server/operator-app.ts`
- `src/lib/server/auth-actions.ts`

### Behavior with `OGA_APP_ORIGIN`

If `OGA_APP_ORIGIN` is set:

- `/oga-login` redirects to the standalone operator `/login`
- `/oga` redirects to standalone `/oga-v2`
- `/oga-v2` redirects to standalone `/oga-v2`
- public auth and recovery flows send OGA users to the standalone operator destination

If `OGA_APP_ORIGIN` is not set:

- the public repo can still serve the legacy embedded operator routes for compatibility

## 9. Local Development

### What you need locally

You need:

- Node.js / npm
- a configured Postgres-compatible connection string
- a migrated schema
- env vars for both the public app and the operator app

### Local apps

Run from repo root:

```bash
npm install
npm run dev
npm run dev:oga
```

That starts:

- public app on `http://localhost:3000`
- operator app on `http://localhost:3001`

### Suggested local URLs

Public app:

- `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- `OGA_APP_ORIGIN=http://localhost:3001`

Operator app:

- `NEXT_PUBLIC_APP_URL=http://localhost:3001`
- `NEXT_PUBLIC_PUBLIC_APP_URL=http://localhost:3000`

### Minimum local DB env

For the runtime itself, configure at least one of:

- `DATABASE_URL`
- `DIRECT_URL`

For full local parity and migrations, set both.

### Other important env

Public app and/or operator app may also need:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` as legacy fallback if needed
- `SUPABASE_SERVICE_ROLE_KEY` as legacy fallback if needed
- `LOCATION_PROVIDER`
- `GOOGLE_MAPS_API_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`

### Local setup sequence

Recommended order:

```bash
npm install
npm run db:migrate
npm run seed
npm run oga:ensure -- --check
npm run dev
npm run dev:oga
```

### Important local command meanings

`npm run db:migrate`

- applies the SQL migrations
- should be run before trying to use the app on a fresh database

`npm run seed`

- resets the configured database to the starter dataset
- destructive for the target database
- use only on local or staging databases

`npm run seed:supabase`

- bootstraps the starter dataset into Postgres from the seed store
- useful when preparing a fresh environment

`npm run oga:ensure -- --check`

- verifies the canonical OGA account in the configured database

`npm run validate`

- resets and exercises multiple important flows directly against the configured database
- destructive for the target database
- do **not** run against a live shared production database

### Local behavior summary

In local development, if everything is configured correctly:

- the public app uses the same DB-backed runtime model as live
- the operator app is separate and reachable on port `3001`
- public `/oga` routes redirect to the operator app when `OGA_APP_ORIGIN` is set
- the session model stays custom and DB-backed
- location defaults can still use the mock provider unless you wire a real provider

## 10. Live Deployment

The live target is a split Vercel deployment.

### Public deployment

- Deploy source: repo root
- Domain target: `gistmata.com`
- Temporary host during setup: current public Vercel deployment

### Operator deployment

- Deploy source: `apps/oga`
- Domain target: `oga.gistmata.com`
- Temporary host during setup: `oga.gistmata.vercel.app`

### Live env rule

The public app must set:

- `OGA_APP_ORIGIN=https://oga.gistmata.com`

Or during testing:

- `OGA_APP_ORIGIN=https://oga.gistmata.vercel.app`

That ensures operator traffic leaves the public route tree.

### Live behavior summary

In live:

- the public app serves public product routes
- operator routes should redirect out to the standalone operator app
- both deployments use the same database
- both deployments use the same service layer and permissions model
- secure cookies are enabled
- demo bypasses are disabled in production

## 11. Validation Before Shipping

Use these commands as the main safe validation set:

```bash
npm run lint
npm run lint:oga
npm run typecheck
npm run typecheck --workspace apps/oga
npm test
npm run build
npm run build:oga
```

### What passed recently in this repo state

The following have already been run successfully in the current productionization pass:

- `npm run lint`
- `npm run lint:oga`
- `npm run typecheck`
- `npm run typecheck --workspace apps/oga`
- `npm test`
- `npm run build`
- `npm run build:oga`
- `npm run oga:ensure -- --check`

### Destructive validation warning

These commands mutate or reset the configured database:

- `npm run seed`
- `npm run seed:supabase`
- `npm run validate`

Do not aim them at the live production database unless that reset is intentional.

## 12. Security and Production Rules

### Do

- keep `SUPABASE_SECRET_KEY` server-only
- keep `DATABASE_URL` and `DIRECT_URL` private
- use `OGA_APP_ORIGIN` to separate public and operator traffic
- verify the OGA account with `npm run oga:ensure -- --check`
- use a staging database for destructive validation

### Do not

- put secret keys in frontend code
- rely on public demo text or seeded recovery leaks
- enable development-only OGA bypasses in production
- run `seed` or `validate` against the live shared database casually
- treat Supabase Auth as the current login system for this app

### Important production fact

`ALLOW_OGA_DEMO_ACCESS` is development-only.

Even if mis-set, the production guard now disables it when `NODE_ENV=production`.

## 13. Current Temporary Legacy State

The final architecture is split, but one compatibility layer still remains in the repo.

### Still present temporarily

- legacy public `/oga` route tree in `src/app/(oga)/oga`
- legacy public `/oga-v2` compatibility routes

### Current rule

- keep them only until the standalone operator deployment is live and verified
- do not use them as the final production architecture
- once standalone operator verification is complete, remove or disable the legacy public operator tree safely

## 14. Where To Read the Code

If you want to understand the app quickly, start here:

### Product and route entrypoints

- `src/app`
- `apps/oga/app`

### Shared product logic

- `src/lib/server/services`
- `src/lib/server/repositories`
- `src/lib/server/store`

### Auth and session

- `src/lib/server/auth/session.ts`
- `src/lib/server/auth/access.ts`
- `src/lib/server/services/auth/index.ts`
- `src/lib/server/auth-actions.ts`

### Split deployment

- `next.config.ts`
- `src/lib/server/operator-app.ts`
- `docs/split-deployment.md`

### Architecture notes

- `docs/service-layer-map.md`
- `supabase/migrations/`

## 15. Short Version

GistMata is now a **two-surface product with one backend truth**.

- the public app lives at the repo root
- the operator app lives in `apps/oga`
- both use shared services and repositories in `src/lib/server`
- both use the same Postgres-backed data truth
- auth is custom DB-backed auth, not Supabase Auth
- local development uses two Next.js servers and one shared database
- live deployment uses two Vercel projects and one shared database
- legacy public `/oga` still exists only as a temporary compatibility layer
