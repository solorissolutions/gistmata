# GistMata Semi-Live Transition Map

Supabase/Postgres is now the intended runtime authority for migrated flows. The legacy JSON store remains a dev-only fallback when no database connection is configured, and it is isolated under `src/lib/server/store/legacy-file-store.ts`.

## Current Source -> Target Entity -> Runtime Seam

| Current runtime source | Target table/entity | Repository / service seam |
| --- | --- | --- |
| `joinDrafts` in store | `join_drafts` | `onboarding-repository` -> `onboardingService` |
| `users` / `sessions` | `users`, `sessions`, `account_recovery_events` | `auth-repository` -> `authService` |
| `referralCodes` | `referral_codes` | `referral-repository` -> `referralService` |
| `gists` | `gists` | `gist-repository`, `mata-repository` -> `gistService`, `mataService` |
| `gistRelations` | `gist_relations` | `matter-repository` -> `matterService` |
| `gistComments` | `gist_comments` | `interaction-repository` -> `interactionService` |
| `gistReactions` | `gist_reactions` | `interaction-repository` -> `interactionService` |
| `savedGists` | `saved_gists` | `interaction-repository` -> `interactionService`, locker reads |
| `gistReports` | `gist_reports` with lifecycle state | `trust-repository` -> `trustService`, oga moderation flows |
| `surveys`, `surveyOptions`, `surveyVotes` | `surveys`, `survey_options`, `survey_votes` | `survey-repository` -> `surveyService` |
| `contactOgaMessages` | `contact_messages` | `contact-repository` -> `contactService`, oga inbox |
| `alerts` | `alerts` | `alerts-repository` -> `alertsService` |
| `userPointsLedger` | `user_points_ledger` | `score-repository` -> `scoreService` |
| `userTrustProfiles` | `user_trust_profiles` | `trust-repository` / oga read models |
| `pinnedGists` | `pinned_gists` | `oga-repository` / matter ops services |
| `ogaActions` | `oga_actions` | oga services and dashboards |
| `locationCache` | `location_cache` | location provider cache / operator location view |
| `featureFlags` | `feature_flags` | alerts / feed / oga settings reads |
| `predictionModules` | `prediction_modules` | legacy runtime compatibility only, not a live product focus |

## Runtime Provider Rules

- If `DIRECT_URL` or `DATABASE_URL` is configured, the app uses the Postgres-backed store adapter in `src/lib/server/store/postgres-store.ts`.
- If no database connection is configured, the app falls back to `src/lib/server/store/legacy-file-store.ts`.
- The fallback is for local/dev survivability only and is not the intended shared truth.

## Bootstrap Path

- `scripts/bootstrap-supabase.ts` moves current local data into Postgres.
- It prefers the current legacy file-backed store if present.
- If no file-backed store exists, it seeds the current starter dataset into Postgres once.
