# GistMata Service Layer Map

## Folder Structure

```text
src/lib/contracts/service-layer.ts
src/lib/server/repositories/
  auth-repository.ts
  onboarding-repository.ts
  mata-repository.ts
  gist-repository.ts
  matter-repository.ts
  interaction-repository.ts
  trust-repository.ts
  survey-repository.ts
  referral-repository.ts
  score-repository.ts
  alerts-repository.ts
  contact-repository.ts
  oga-repository.ts
  location-repository.ts
src/lib/server/services/
  auth/
  onboarding/
  mata/
  gist/
  matter/
  interaction/
  trust/
  survey/
  referral/
  score/
  alerts/
  contact/
  oga/
  location/
```

## Service Ownership

- `authService`: current viewer/session, login, logout, recovery, OGA guards.
- `onboardingService`: referral draft start, username/PIN/basics progression, join finalization.
- `mataService`: shared feed bundle access for public Mata routes.
- `gistService`: root gist creation, gist detail loading, locker gist retrieval.
- `matterService`: follow-up gist creation and matter-chain retrieval.
- `interactionService`: comments, reactions, saves, viewer interaction state.
- `trustService`: reports, moderation queue, remove/restore flows, trust summary lookup.
- `surveyService`: public survey bundle access, voting, operator survey lifecycle controls.
- `referralService`: user referral bundle, user code generation, OGA referral metrics.
- `scoreService`: score bundle, leaderboard bundle, tier/allowance helpers.
- `alertsService`: user alerts, operator broadcasts, broadcast history.
- `contactService`: Contact Oga submission, public contact bundle, operator inbox operations.
- `ogaService`: OGA dashboard snapshots and operator-facing bundles such as overview, matters, inbox, growth, and location health.
- `locationService`: posting location resolution and shared location context helpers.

## Repository Role

- Repositories are thin adapters over the current store, location, and session primitives.
- They do persistence and legacy module calls only.
- They do not own redirects, cookie orchestration, or UI-specific branching.

## Migration Summary

- Public routes are being moved from direct `store` and `auth/dal` imports onto service calls.
- OGA and OGA v2 actions are being moved onto shared operator services for pinning, moderation, inbox, broadcast, surveys, and referrals.
- `auth/dal.ts` remains as a compatibility wrapper, but the service layer becomes the intended guard and session seam.

## Remaining Legacy Areas

- `src/lib/server/store/index.ts` still contains mixed persistence and business logic.
- `src/lib/server/oga-v2.ts` still owns the large operator snapshot builder; `ogaService` currently consumes it as a transitional adapter.
- Some UI search/filtering remains in pages because that is page orchestration rather than shared platform policy.

## Shared-Truth Result

- Public routes and operator routes now have a single service seam for the same backend truth.
- Session and permission checks can be centralized in service guards instead of repeated page logic.
- Operator actions mutate the same store-backed data used by the public app rather than a dashboard-only model.
