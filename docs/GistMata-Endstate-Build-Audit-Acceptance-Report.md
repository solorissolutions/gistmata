# GistMata Endstate Build Audit & Acceptance Report

Audit date: 2026-03-26  
Codebase audited: `C:\Users\Owner\Downloads\gistmata`  
Method: direct code audit + route inventory + server/store audit + command validation (`typecheck`, `build`, `test`, `validate`, `lint`).

## 1) Executive verdict

This build is usable as a high-fidelity demo foundation, but it is not endstate-complete and not production-real yet.

- Truly implemented against endstate intent: **~62%**
- Production-real (not demo-scaffolded): **~28%**
- Demo-only behavior still present: **~50%**
- Broken in current build: **~10%**
- Missing entirely: **~22%**
- Drifted from product vision (concept + execution): **~18%**

### Status rollup

| Bucket | Verdict | Notes |
|---|---|---|
| Done | `Medium` | Referral-gated join, pseudonymous username/PIN/account recovery path, feed + gist + comments + reactions + reports, Oga dashboard base, theme/hydration stabilization baseline. |
| Partial | `High` | Hyperlocal behavior, follow-up continuity UX, survey scope behavior, shell consistency, trust/safety operations, accessibility. |
| Broken | `Material` | Missing `/oga/inbox`, broken Mata empty-state links, Contact Oga sheet category mismatch, survey scope not enforced. |
| Not started | `Material` | Real production data layer/runtime (live Supabase repository), inactivity consequence lifecycle, account deletion policy, browser compatibility matrix/E2E. |
| Drifted from vision | `Material` | Demo-store truth instead of backend truth, Oga operations not fully operational (inbox route gap), product-language inconsistency and placeholder behavior in critical flows. |

## 2) Vision alignment audit

Does this currently feel like GistMata? **Partly yes.**

| Principle | Status | Evidence |
|---|---|---|
| anonymous-first | `Partly working` | Public UI avoids real identity; moderation blocks obvious personal data in `src/lib/domain/moderation.ts`. But dev recovery code patterns and demo hints leak operational shortcuts (`src/app/(marketing)/locker/recovery/page.tsx`, `src/lib/server/store/index.ts`). |
| hyperlocal-first | `Partly working` | Feed filters by street/area/state in `getFeedBundle` (`src/lib/server/store/index.ts:977+`), location captured at posting in `DropGistForm`. But location provider is mock/placeholder (`src/lib/server/location/google-provider.ts`). |
| no DMs/private messaging | `Working` | No user-to-user DM surface exists. Only user->oga contact flow. |
| no identity/follower culture | `Mostly working` | No followers/profiles/avatars. Some dashboard/table-heavy screens feel admin-console heavy. |
| oga as institutional operator | `Partly working` | Oga rails, moderation, survey, growth, broadcast are present. Inbox flow exists in backend but route missing. |
| text-first | `Working` | Gist/comment forms are text-only; no media upload surfaces. |
| public-square feel | `Partly working` | Mata feed and gist routes are strong. Some pages drift into card-heavy dashboard feel. |
| “Na una get de mata” philosophy | `Partly working` | Language and structure align; backend shortcuts and missing lifecycle/safety adjudication dilute trust depth. |

### Drift patterns observed

- Generic admin/SaaS feel appears on several Oga pages (`/oga/*`) due metrics-card heavy layouts.
- Forum-like drift remains where comment/follow-up continuity is still route-fragmented (no dedicated Matter view route despite backend function).
- Concept drift: feature flag `dark_mode` remains `false` in constants while theme system is now active (`src/lib/domain/constants.ts`).

## 3) Route-by-route implementation map

Legend:  
`Fully working` = route behavior and intent aligned  
`Partly working` = route works but has integration/consistency gaps  
`Broken` = route or critical behavior is incorrect/missing

| Route | Intended purpose | Current status | Product match | Correct shell/layout | Mobile-ready | Themed correctly | Stable |
|---|---|---|---|---|---|---|---|
| `/` | entry router | `Fully working` | Yes | N/A | Yes | Yes | Yes |
| `/join` | referral-gated start | `Fully working` | Yes | Join layout | Yes | Yes | Yes |
| `/join/username` | permanent username | `Fully working` | Yes | Join layout | Yes | Yes | Yes |
| `/join/pin` | PIN setup | `Fully working` | Yes | Join layout | Yes | Yes | Yes |
| `/join/account-code` | account code reveal | `Partly working` | Yes | Join layout | Yes | Mostly | Yes |
| `/join/basics` | basics onboarding | `Fully working` | Yes | Join layout | Yes | Yes | Yes |
| `/join/rules` | rules acceptance | `Fully working` | Yes | Join layout | Yes | Yes | Yes |
| `/login` | returning login | `Fully working` | Yes | Marketing shell | Yes | Yes | Yes |
| `/locker/recovery` | account recovery | `Partly working` | Yes | Marketing shell | Yes | Yes | Yes |
| `/mata` | primary feed | `Partly working` | Yes | App shell + context rail | Yes | Yes | **No** (bad empty-state links) |
| `/mata/[level]` | level feed views | `Fully working` | Mostly | App shell + context rail | Yes | Yes | Yes |
| `/gist/[id]` | gist detail + comments/follow-ups | `Fully working` | Mostly | App shell + context rail | Yes | Yes | Yes |
| `/judgement-day/[id]` | survey voting/results | `Partly working` | Partly | App shell + context rail | Yes | Yes | Yes |
| `/drop` | post gist | `Fully working` | Yes | App shell + context rail | Yes | Yes | Yes |
| `/drop/follow-up/[parentId]` | create follow-up gist | `Partly working` | Mostly | App shell only (no shared context rail) | Yes | Yes | Yes |
| `/alerts` | grouped notifications | `Partly working` | Mostly | App shell (no context rail) | Yes | Yes | Yes |
| `/score` | points/tier summary | `Partly working` | Mostly | App shell (custom 2-col) | Yes | Yes | Yes |
| `/score/leaderboard` | leaderboard | `Fully working` | Yes | App shell + context rail | Yes | Yes | Yes |
| `/score/tiers` | tier explainer | `Fully working` | Yes | App shell + context rail | Yes | Yes | Yes |
| `/locker` | private utility hub | `Fully working` | Yes | App shell + locker layout | Yes | Yes | Yes |
| `/locker/my-gists` | private own gists | `Fully working` | Yes | App shell + locker layout | Yes | Yes | Yes |
| `/locker/referrals` | referral allowance/codes | `Fully working` | Yes | App shell + locker layout | Yes | Yes | Yes |
| `/locker/privacy` | privacy policy | `Fully working` | Yes | App shell + locker layout | Yes | Yes | Yes |
| `/locker/saved` | saved gists | `Fully working` | Yes | App shell + locker layout | Yes | Yes | Yes |
| `/locker/settings` | session/local settings | `Partly working` | Mostly | App shell + locker layout | Yes | Yes | Yes |
| `/contact-oga` | contact operator | `Partly working` | Mostly | App shell + context rail | Yes | Yes | **No** (sheet variant has category mismatch) |
| `/support` | support FAQ | `Partly working` | Mostly | App shell (no context rail) | Yes | Yes | Yes |
| `/oga` | oga overview | `Partly working` | Mostly | Oga shell | Yes | Yes | Yes |
| `/oga/mata` | mata monitor | `Partly working` | Mostly | Oga shell | Yes | Yes | Yes |
| `/oga/gists` | moderation list | `Partly working` | Mostly | Oga shell | Yes | Yes | Yes |
| `/oga/trust` | trust queue | `Partly working` | Partly | Oga shell | Yes | Yes | Yes |
| `/oga/users` | users moderation snapshot | `Partly working` | Mostly | Oga shell | Yes | Yes | Yes |
| `/oga/judgement-day` | survey ops | `Partly working` | Mostly | Oga shell | Yes | Yes | Yes |
| `/oga/growth` | referrals/retention | `Partly working` | Mostly | Oga shell | Yes | Yes | Yes |
| `/oga/broadcast` | broadcast alerts | `Partly working` | Mostly | Oga shell | Yes | Yes | Yes |
| `/oga/location` | location health | `Partly working` | Partly | Oga shell | Yes | Yes | Yes |
| `/oga/settings` | flags + audit | `Partly working` | Partly | Oga shell | Yes | Yes | Yes |
| `/oga/inbox` | message inbox | **Broken (missing route)** | No | N/A | N/A | N/A | No |
| `/403` | oga denial | `Fully working` | Yes | Marketing-style shell | Yes | Yes | Yes |

## 4) User-flow acceptance

### Flow: First-time user (join by referral -> username -> PIN -> account code -> onboarding -> Mata)

- Expected: strict referral gate, permanent username, PIN, account code reveal, onboarding, then `/mata`.
- Actual: works end-to-end via `auth-actions` + join routes.
- Verdict: **Pass (with caveats)**.
- Issues found:
  - Account code is reveal-in-flow but supporting messaging/docs have inconsistencies.
  - Join quality is demo-store backed, not production persistence.

### Flow: Returning user (persistent session + username/PIN login + no wrong join redirect)

- Expected: existing session goes to `/mata` or `/oga`; login with username/PIN works.
- Actual: works (`getCurrentViewer`, `loginAction`, route redirects).
- Verdict: **Pass**.
- Issues found:
  - No visible brute-force/rate-limit controls on PIN login.

### Flow: Recovery user (Account Code + PIN restore)

- Expected: account code + PIN restores session.
- Actual: works (`recoverSession`).
- Verdict: **Pass (with critical UX inconsistency)**.
- Issues found:
  - Recovery page displays demo code `MATA-OGA1-7742` while oga account normalization uses `GM-0001-OG` (`src/app/(marketing)/locker/recovery/page.tsx` vs `src/lib/server/store/index.ts`).

### Flow: Gist poster (open app -> drop gist -> auto location -> tag -> post -> redirect)

- Expected: post text-only gist with location tagging and redirect to detail.
- Actual: works (`DropGistForm`, `/api/location/resolve`, `submitGist`).
- Verdict: **Pass (demo-grade)**.
- Issues found:
  - Location provider remains mock/placeholder.
  - No offline queue; explicitly blocked when offline.

### Flow: Silent reader (browse Mata -> switch levels -> save gist -> vote survey)

- Expected: high-value read path without posting.
- Actual: browsing/switching/saving/voting all work.
- Verdict: **Pass (partial)**.
- Issues found:
  - Survey scope not enforced by geography in feed selection.

### Flow: Follow-up contributor (open gist -> create follow-up -> continuity)

- Expected: follow-up creates linked matter continuity.
- Actual: follow-up posting and relation storage work.
- Verdict: **Partly pass**.
- Issues found:
  - No dedicated Matter view route even though `getMatterChain` exists.
  - Follow-up compose page lacks the shared context-rail shell pattern.

### Flow: Survey participant (pinned survey -> anonymous vote -> aggregate only -> points)

- Expected: anonymous vote, aggregate display, points reward.
- Actual: vote is one-per-user, aggregate shown, points awarded.
- Verdict: **Partly pass**.
- Issues found:
  - Scope type/value is stored but not enforced in surfacing/voting contexts.

### Flow: Oga (access dashboard -> create survey -> moderate -> pin -> inbox -> pulse)

- Expected: complete operator workflow including inbox.
- Actual: most operations work; inbox backend exists.
- Verdict: **Fail (incomplete)**.
- Issues found:
  - `/oga/inbox` route missing.
  - Dev bypass is env-gated but unsafe if misconfigured in production.

## 5) Feature truth table

| Feature | Intended product behavior | Exists? | Works fully? | Works partly? | Broken? | Correctly integrated? | Notes |
|---|---|---|---|---|---|---|---|
| referral system | referral-gated entry | Yes | Yes | No | No | Mostly | `beginJoinDraft` validates active unused codes. |
| referral limits | 5 lifetime regular, oga separate | Yes | Yes | No | No | Mostly | `DEFAULT_REFERRAL_ALLOWANCE=5`; oga unlimited. |
| username permanence | set once | Yes | Mostly | Yes | No | Mostly | No update route; permanent by absence, not by explicit policy layer. |
| PIN | 6-digit auth factor | Yes | Yes | No | No | Yes | Enforced in validation/store. |
| Account Code | recovery companion to PIN | Yes | Partly | Yes | No | Partly | Demo hints inconsistent; dev shortcuts present. |
| login | username + PIN | Yes | Yes | No | No | Yes | Works with session creation. |
| recovery | account code + PIN restore | Yes | Yes | No | No | Partly | UX doc/value mismatch for oga demo code. |
| location tagging | post-time location resolution | Yes | Partly | Yes | No | Partly | Mock/placeholder provider. |
| feed levels | street/area/state/nigeria/hot | Yes | Yes | No | No | Mostly | Works in bundle logic. |
| content tags | one tag per gist | Yes | Yes | No | No | Yes | Enforced in schema + UI select. |
| reactions | one reaction per user per gist | Yes | Yes | No | No | Yes | Toggle/swap behavior correct. |
| comments | capped comments per gist/user | Yes | Yes | No | No | Yes | max 3 per user per gist enforced. |
| Follow-up Gists | linked continuation posts | Yes | Partly | Yes | No | Partly | Relation saved; no dedicated Matter route UX. |
| Matter view | dedicated continuity view | Partly | No | Yes | No | No | Backend helper exists; route missing. |
| save | private gist bookmarks | Yes | Yes | No | No | Yes | `/locker/saved` works. |
| Contact oga | user->oga support | Yes | Partly | Yes | **Yes** | Partly | Sheet categories mismatch validation (`Support/Safety/Others` invalid). |
| Judgement Day | oga-created anonymous surveys | Yes | Partly | Yes | No | Partly | Scope logic not enforced in serving. |
| points | points accrual memory | Yes | Partly | Yes | No | Mostly | Works, but business rules are simplistic/static. |
| tiers | points tier ladder | Yes | Partly | Yes | No | Mostly | Works with constants; no dynamic policy layer. |
| leaderboard | monthly/all-time ranking | Yes | Partly | Yes | No | Mostly | Works; presentation is basic. |
| inactivity warning | warning/handling inactive users | Partly | No | Yes | No | No | Only manual broadcast targeting by `lastActiveAt`. |
| account deletion policy | inactivity consequences/deletion lifecycle | No | No | No | No | No | Not implemented. |
| oga dashboard | operator console | Yes | Partly | Yes | No | Partly | Major route set exists; inbox missing. |
| theme system | coherent dark/light across app | Yes | Mostly | Yes | No | Mostly | Stabilized; minor drift remains (flags and isolated hardcoded surfaces). |
| accessibility | keyboard, labels, focus, semantics | Partly | No | Yes | No | No | Major gaps in dialogs/forms and focus management. |
| mobile responsiveness | usable mobile shell | Yes | Mostly | Yes | No | Mostly | Strong baseline; some route shell drift. |
| cross-browser behavior | Chrome/Safari/Firefox/Edge verified | No | No | No | No | No | No test evidence in repo. |

## 6) UX experience audit

| UX question | Verdict | Notes |
|---|---|---|
| Mata feels primary | `Yes` | `/mata` + levels + gist detail are the strongest experience. |
| geography-first feel | `Mostly` | Feed logic is geography-first; location provider realism is still mock. |
| Gist feels fast to send | `Mostly` | Post path is straightforward; offline path is blocked, not queued. |
| comments secondary | `Yes` | Comments sit below gist and capped. |
| follow-up feels like continuation | `Partly` | Relation model is good; no dedicated Matter route. |
| avoids identity pressure | `Mostly` | No followers/profiles, but leaderboard still creates mild status pressure. |
| avoids card-heavy clutter | `Partly` | Some routes are clean; many Oga pages are card-grid heavy. |
| Nigerian-native feel | `Mostly` | Language, taxonomy, and labels are localized; some dashboard pages feel generic admin. |

### Sections that feel off

- Too corporate/dashboard-like: `/oga`, `/oga/mata`, `/oga/users`, `/oga/settings`.
- Too cloned/template-like: parts of Oga card grids and metrics rows.
- Too noisy: Oga pages with dense metric cards and limited action hierarchy.
- Too gamey risk: score + leaderboard can drift if trust/safety context is not equally emphasized.

## 7) Theme and layout audit

### Theme status

- Dark mode status: **Mostly stable**
- Light mode status: **Mostly stable**
- Hydration/theme mismatch status: **Resolved at code level**
- Route shell consistency: **Improved, not complete**

### Exact findings

| Area | Status | Exact route/component | Cause | Exact fix needed |
|---|---|---|---|---|
| SSR theme source-of-truth | Fixed | `src/app/layout.tsx`, `src/components/app-shell/theme-provider.tsx`, `src/lib/theme.ts` | Theme now normalized from cookie on server and reused on client provider. | Keep this pattern; avoid additional client-side html mutations outside provider. |
| html/data-theme hydration mismatch | Fixed | `src/app/layout.tsx` + provider | Server/client now share same initial `data-theme`. | Add regression test if possible. |
| mixed-theme risk surface | Minor | `src/components/join/account-code-card.tsx` | Hardcoded dark gradient + white text block is isolated and can feel visually detached in light theme. | Keep if intentional; otherwise convert to semantic tokens. |
| shell consistency gap | Open | `/drop/follow-up/[parentId]`, `/alerts`, `/score`, `/support` | These do not use the same context-rail pattern as key Mata pages. | Standardize on `PageWithContextRail` where product-appropriate. |
| broken navigation links | **Open/Blocking** | `/mata` empty state (`src/app/(app)/mata/page.tsx`) | Links use non-existent routes `/mata/my-state`, `/mata/national`. | Change to `/mata/state` and `/mata/nigeria`. |
| Oga shell consistency | Partly fixed | `src/app/(oga)/oga/layout.tsx` | Stable left rail + page column exists. | No immediate shell break; add inbox route for full operator flow. |

### Mobile adaptation

- Baseline is good: `grid-shell` + bottom nav + sticky mobile rail header.
- Remaining issue: some routes bypass shared context rail, creating page-to-page UX drift.

## 8) Trust, privacy, and safety audit

| Control area | Verdict | Evidence |
|---|---|---|
| no real identity exposure in public feeds | `Mostly working` | Public gist/comment views avoid real identity fields. |
| no public invitee identity in referrals | `Working` | User referral page shows used/unused only, no invitee identity. |
| personal-data detection before publish | `Working (rule-based)` | `detectPersonalData` blocks obvious phone/email/account/address patterns. |
| personal-data report flow | `Partly working` | Report creation exists; adjudication workflow absent. |
| fake-location report flow | `Partly working` | Report type exists; no verification pipeline. |
| moderation flow | `Partly working` | Oga can remove/restore/pin; no report-state lifecycle (open/triaged/resolved/invalid). |
| comot Tag logic | `Partly working` | Auto-threshold exists but penalties apply immediately from raw reports. |
| anonymous surveys | `Mostly working` | UI only shows aggregate votes; no voter identity in UI. |
| no visible voter identity | `Working in UI` | Survey card and Oga screens avoid per-user vote display. |
| data minimization | `Partly working` | Location stores labels/confidence; raw coords not persisted in store. Demo/dev shortcuts still expose sensitive operational fields. |

### Privacy promise violations / risks

- Trust score penalties and comot tag can be triggered immediately by reports before moderation adjudication (`reportGist`).
- Dev recovery code handling creates operational shortcuts that should not survive production behavior.
- No explicit anti-doxxing escalation flow beyond regex blocking and generic reporting.

## 9) Oga operating audit

| Oga capability | Verdict | Notes |
|---|---|---|
| oga account existence | `Working` | `ensureOgaAccount` normalizes single oga identity. |
| oga access method | `Working` | `requireOgaViewer` gate + redirect policy. |
| dev/demo access behavior | `Working` | `ALLOW_OGA_DEMO_ACCESS=true` bypasses auth as requested. |
| production protection behavior | `Partly working / risky` | Depends entirely on env hygiene; bypass has no hard production guard if env is mis-set. |
| survey creation | `Working` | Create/pin/close flows implemented. |
| moderation controls | `Partly working` | Remove/restore/pin works; queue adjudication lifecycle missing. |
| analytics visibility | `Partly working` | Overview metrics present but derived from demo store. |
| referral control | `Working` | Oga growth can generate batches. |
| message inbox | **Broken** | Backend bundle exists (`getOgaInboxBundle`), route `/oga/inbox` missing. |
| pinning ability | `Working` | Priority 1-3 with slot management works. |
| branding correctness | `Working` | Oga rail uses `LogoLockup` and product branding; no stock-template image use seen in oga shell. |

## 10) Data-model and backend audit

Core problem: **two truths** exist.

- Runtime truth: local JSON demo store (`.data/gistmata-demo-store.json`) via `src/lib/server/store/index.ts`.
- Intended production truth: Supabase SQL contract in `supabase/migrations/0001_gistmata_mvp.sql`.

These are not fully aligned.

| Entity | Expected product model | Current model | Mismatch / missing | Risk |
|---|---|---|---|---|
| users | pseudonymous identity + trust + lifecycle | Present in demo store + SQL | Demo-only fields (`devRecoveryCode`) and security shortcuts | Medium |
| sessions | robust secure sessions | hash-based sessions in store | No distributed/session-store hardening | Medium |
| referrals | referral lineage + limits | Present | Works, but operational analytics still demo-grade | Low |
| gists | text posts + metadata + status | Present | SQL schema lacks `follow_up_count` field parity | Medium |
| follow-up relations | explicit parent/child relation graph | Present in store as `gistRelations` | SQL migration missing `gist_relations` table | **High** |
| comments | capped comments, possible threading | Present | `parentCommentId` exists but no threaded UX | Low |
| reports | report lifecycle with adjudication | Present | No report status/resolution table/state | **High** |
| surveys | scoped anonymous polls | Present | Scope stored but not enforced in feed/voting logic | **High** |
| votes/results | anonymous aggregate results | Present | User vote IDs stored; UI anonymous, backend policy basic | Medium |
| points ledger | durable points memory | Present | Rule engine simplistic/static | Low |
| saved gists | private saves | Present in store | SQL migration missing table | **High** |
| contact messages | user->oga inbox workflow | Present in store | SQL migration missing table; route missing | **High** |
| oga actions | audit trail | Present | Works but tied to demo store | Medium |

### Dangerous shortcuts

- File-backed store as runtime source-of-truth.
- Unsalted SHA-256 hashing for PIN/account code material.
- No visible rate limiting/lockout around login/recovery/report abuse.
- Write serialization (`writeChain`) is process-local only.

## 11) Accessibility and compatibility audit

| Area | Verdict | Notes |
|---|---|---|
| keyboard access | `Partly working` | Core nav and forms are keyboard-usable; drawers/sheets lack robust focus trapping and escape handling. |
| focus visibility | `Partly working` | Button component has focus styles; many raw `<button>` usages do not consistently apply focus styles. |
| label quality | `Partly working` | Public forms are mostly labeled; several Oga forms rely heavily on placeholders and generic fields. |
| icon accessibility | `Partly working` | Many icons are `aria-hidden`; consistency is mixed. |
| mobile browser behavior | `Partly working` | Layout strategy is strong; no real browser matrix evidence. |
| Safari/Firefox/Chrome/Edge | `Not validated` | No explicit cross-browser test artifacts. |
| viewport/sticky rails/scroll containers | `Partly working` | Single-column scroll pattern mostly works; hidden scrollbars globally may reduce usability. |
| form usability | `Partly working` | Good on core flows; Oga operation forms need stronger labels/error affordances. |

## 12) Regression ledger

| Issue | Severity | Route(s) affected | Cause | Fix recommendation | Blocking? |
|---|---|---|---|---|---|
| Broken Mata empty-state links | P1 | `/mata` | Links to non-existent `/mata/my-state` and `/mata/national` | Replace with `/mata/state` and `/mata/nigeria` | Yes |
| Oga inbox route missing | P1 | `/oga/inbox` | Route not implemented while backend/actions/constants reference it | Add `/src/app/(oga)/oga/inbox/page.tsx` and wire `getOgaInboxBundle` | Yes |
| Contact Oga sheet category mismatch | P1 | app shell contact sheet | QUICK_CATEGORIES includes invalid values vs schema enum | Align sheet categories to `CONTACT_OGA_CATEGORIES` | Yes |
| Survey scope not enforced | P1 | `/mata`, `/judgement-day/[id]`, oga survey ops | `scopeType/scopeValue` stored but not applied to visibility logic | Apply scope filter in survey selection and eligibility checks | Yes |
| Recovery hint code inconsistency | P1 | `/locker/recovery` | Hardcoded hint does not match normalized oga recovery code | Correct hardcoded demo hint/source-of-truth | Yes |
| Oga demo bypass env risk | P1 (risk) | `/oga*` | Bypass relies solely on env var, no hard prod guard | Add explicit prod guard or deployment policy enforcement | Yes (security gate) |
| Feature flag drift: `dark_mode` false while theme active | P2 | Oga settings + config semantics | Legacy flag values not aligned with current implementation | Update flags or remove stale flag | No |
| Shell drift on non-context routes | P3 | `/drop/follow-up/[parentId]`, `/alerts`, `/score`, `/support` | Not using shared context rail pattern | Standardize route wrapper decisions | No |
| Lint debt remains | P3 | `src/lib/server/store/index.ts`, `src/types/jsdom.d.ts` | `module` variable name + `any` type | Rename variable, tighten jsdom typing | No |

## What is still missing before true endstate?

### Must fix now

1. Implement `/oga/inbox` route and complete message workflow.
2. Fix broken `/mata` empty-state route links.
3. Fix Contact Oga sheet category schema mismatch.
4. Enforce survey scope behavior in visibility/voting logic.
5. Resolve recovery code inconsistency in public recovery UX.
6. Harden Oga demo bypass production safety policy.

### Should fix next

1. Add Matter view route using existing `getMatterChain`.
2. Unify shell/context rail behavior across key secondary routes.
3. Add report adjudication lifecycle (status, resolution, reversal).
4. Align feature flags with actual product state (especially theme flag).
5. Close lint debt and add regression tests for above failures.

### Future phase

1. Replace demo JSON runtime with production repository (Supabase-backed).
2. Implement real location provider and confidence handling.
3. Build inactivity warning + consequence lifecycle and deletion policy.
4. Add robust browser E2E suite (Chrome/Safari/Firefox/Edge).

### Vision drift risks

1. Remaining dashboard/SaaS visual drift inside Oga can weaken “public square + institutional operator” tone.
2. Trust penalties without adjudication can undermine fairness.
3. Dual data truth (store vs SQL) can create hidden product behavior divergence.

## Command evidence snapshot

- `npm run typecheck`: pass
- `npm run build`: pass (all listed routes compile)
- `npm run test`: pass (7 files, 18 tests)
- `npm run validate`: pass (join/post/report/survey/oga scripted checks)
- `npm run lint`: fail (2 pre-existing errors)
