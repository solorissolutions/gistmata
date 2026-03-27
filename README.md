# GistMata Web MVP

This repository contains the first real web foundation for **GistMata**.

GistMata is:

- anonymous
- hyperlocal
- Nigerian
- text-first
- mobile-first
- privacy-first

GistMata is not:

- Twitter
- Reddit
- a forum with profile culture
- an influencer product
- a follower system
- a DM app

The goal of this codebase is to give you a working product slice that already feels like a real app, not a throwaway prototype.

## Plain-English Product Terms

These names matter and are used carefully in the app:

- **Mata** = the public space, feed, or town square
- **Gist** = one single post
- **Drop Gist** = publish a post
- **Locker** = your private utility area, not a public profile
- **oga** = the private operator/admin account
- **Judgement Day** = the anonymous survey system created by oga

## What This App Already Does

Today, this project already supports:

- referral-gated joining
- permanent username creation
- 6-digit PIN setup
- Account Code reveal for recovery
- anonymous onboarding with only state, age range, and gender
- geography-first Mata feed
- text-only Gist posting
- one tag per Gist
- reactions and comments
- reporting Gists
- score, tiers, and leaderboard
- alerts
- Locker pages
- Judgement Day survey voting
- protected oga dashboard pages

## What Is Real vs What Is Still Mocked

### Real in this repo

- The Next.js app and route structure
- The join flow
- The custom pseudonymous session model
- The feed, detail page, alerts, score, Locker, and oga pages
- Gist posting, comments, reactions, reports, and surveys
- Nigeria-wide seed data
- A persistent local demo datastore
- Validation scripts and basic tests

### Mocked or foundation-only for now

- Runtime persistence still defaults to a local file instead of a live Supabase-backed repository
- Location resolution uses a provider interface, but local development defaults to a mock Nigeria locality resolver
- `LOCATION_PROVIDER=google` is only a placeholder adapter right now
- Translation is only a stub unless seeded text exists
- Predictions are feature-flagged only and not a full public feature yet

## Who This README Is For

This README is written for:

- founders
- non-technical stakeholders
- product people
- designers
- engineers joining the project

You should be able to understand what the app is doing without first reading the source code.

## The Easiest Way To Run It

If you just want to see the app working locally, do this:

```bash
npm install
npm run seed
npm run dev
```

Then open:

```text
http://localhost:3000
```

That is enough to run the demo version.

You do **not** need Supabase keys just to preview the seeded demo app, because the current runtime still uses the local demo store by default.

## 5-Minute Demo Walkthrough

### 1. Join the app

Go to:

```text
/join
```

Use one of these seeded referral codes:

- `GREEN-MATA`
- `NAIJA-YARN`
- `TOWN-SQUARE`

Then continue through:

- username
- PIN
- Account Code
- basics
- rules

### 2. Save the Account Code

The app will show an Account Code once during join.

That code plus the user PIN is the recovery method.

This app does not use:

- email password reset
- phone reset
- public identity recovery

### 3. Enter Mata

After join, the user lands in Mata and can:

- read local Gists
- switch Mata levels
- filter by topic
- react
- comment
- report a Gist

### 4. Drop a Gist

Go to:

```text
/drop
```

The app asks for location at posting time, not during signup.

The MVP only stores:

- locality label
- broader area label
- state
- confidence score

It does **not** store raw coordinates in persistent app data.

### 5. View oga

Use the seeded local oga recovery details:

- Account Code: `MATA-OGA1-7742`
- PIN: `112233`

Recover through:

```text
/locker/recovery
```

If the account is oga, the app routes into:

```text
/oga
```

## What Each Main Area Means

### Mata

This is the public town square.

Feed levels in the UI are:

- My Street
- My Area
- State
- Nigeria
- Hot

This keeps the product geography-first instead of social-graph-first.

### Gist Detail

This is the single-post reading page.

It shows:

- the full Gist
- reactions
- comments
- report action
- post context
- nearby local movement
- live Judgement Day teaser when active

### Drop Gist

This is the posting flow.

Rules in the MVP:

- text only
- max 350 characters
- one tag only
- no hashtags
- no media
- no reposts
- no quote-posting

### Alerts

Alerts are grouped into:

- Comments
- Mata activity
- Judgement Day
- Points
- Account / inactivity

### Score

This area shows:

- points summary
- current tier
- progress toward next tier
- leaderboard teaser
- points history

### Locker

Locker is private utility space.

It is **not** a vanity profile.

Locker includes:

- My Gists
- Referrals
- Recovery
- Privacy
- Settings

Referrals inside Locker follow these rules:

- Regular users get **5 lifetime invites**.
- oga is unlimited (managed separately under oga → Growth).
- Referrers can see whether a code is **Used** or **Unused**.
- Referrers **must not** see who used a code. No username, no state/area, no indirect identity hints.

Referral generation policy in this MVP:

- You can generate multiple unused codes, up to your lifetime cap.
- Every code is one-time use.

### oga

The oga side is the private operations dashboard.

Current sections include:

- Overview
- Mata Monitor
- Gists
- Trust
- Users
- Judgement Day
- Growth
- Broadcast
- Location
- Settings / audit

## Product Guardrails Already Built

The app deliberately avoids the wrong patterns.

It does not include:

- followers
- DMs
- public bios
- public real names
- profile photos
- hashtags
- multi-tag posts

The MVP also blocks obvious personal data like:

- phone numbers
- email addresses
- bank-account-like numbers
- address-style phrasing

If blocked, the user sees:

```text
Your gist get personal info wey we no fit allow. Remove am and repost.
```

## Design Direction In This Codebase

The interface is intentionally:

- calm
- text-led
- green-branded
- light
- minimal
- mobile-first

Desktop uses:

- left rail
- central reading column
- light right rail

Mobile uses:

- bottom navigation
- horizontal chip scrolling where needed
- strong text hierarchy

## How Local Data Works

Right now, the app uses a local demo datastore file:

```text
.data/gistmata-demo-store.json
```

That file is automatically created and updated for local demo usage.

It stores seeded demo records for:

- users
- sessions
- referral codes
- Gists
- comments
- reactions
- reports
- alerts
- surveys
- points ledger
- trust profiles
- oga actions
- cached locations
- feature flags

If you want to reset the demo back to a clean seeded state, run:

```bash
npm run seed
```

## Nigeria-Wide Seed Data

The seed data is not Lagos-only.

It includes sample users and Gists across places like:

- Kano
- Ibadan
- Port Harcourt
- Enugu
- Aba
- Benin City
- Kaduna
- Jos
- Uyo
- Owerri
- Abeokuta
- Ilorin
- FCT/Abuja
- Lagos

The seeded data also includes:

- referral lineage
- trust queue items
- multiple tags
- a live survey
- a closed survey
- low-confidence location examples
- alerts and points history

This helps the oga routes feel realistic on day one.

## Environment Variables Explained Like A Human

Copy:

```text
.env.example
```

to:

```text
.env.local
```

Then fill the real values if you want to connect external infrastructure.

### Browser-safe values

These can be exposed to the browser.

`NEXT_PUBLIC_SUPABASE_URL`

- This is your Supabase project URL
- Example: `https://your-project.supabase.co`

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

- This is the public key meant for browser-safe usage
- It is not your secret server key

### Server-only values

These must stay private.

`SUPABASE_SECRET_KEY`

- This is the server-only secret key
- Never expose this in frontend code
- Never paste this into the browser

### Database connection strings

`DATABASE_URL`

- Best default for serverless or short-lived app connections
- Usually the transaction pooler connection

`DIRECT_URL`

- Best for migrations or long-running direct database access

`SESSION_POOLER_URL`

- Optional
- Only needed if some tool specifically requires the session pooler

### Legacy fallback names

This repo still accepts these older names if needed:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Other useful env vars

`NEXT_PUBLIC_APP_URL`

- The app base URL used for metadata and social previews
- Local default is `http://localhost:3000`

`DATA_PROVIDER`

- Current demo default is `mock`

`LOCATION_PROVIDER`

- Current demo default is `mock`
- `google` exists only as a placeholder adapter today

`GOOGLE_MAPS_API_KEY`

- Optional
- Reserved for future real location-provider wiring

`ALLOW_OGA_DEMO_ACCESS`

- **Development/demo only**.
- When set to `true` (and `NODE_ENV` is not `production`), the app allows opening `/oga` and subpages without an authenticated session.
- This is intentionally for founders/devs to inspect the oga dashboard UI while proper oga auth is still evolving.
- In production, this bypass is disabled regardless of env var.

## Current Route Map

### Public app routes

- `/`
- `/join`
- `/join/username`
- `/join/pin`
- `/join/account-code`
- `/join/basics`
- `/join/rules`
- `/mata`
- `/mata/[level]`
- `/gist/[id]`
- `/drop`
- `/alerts`
- `/score`
- `/score/leaderboard`
- `/score/tiers`
- `/locker`
- `/locker/my-gists`
- `/locker/referrals`
- `/locker/recovery`
- `/locker/privacy`
- `/locker/settings`
- `/judgement-day/[id]`

### Protected oga routes

- `/oga`
- `/oga/mata`
- `/oga/gists`
- `/oga/trust`
- `/oga/users`
- `/oga/judgement-day`
- `/oga/growth`
- `/oga/broadcast`
- `/oga/location`
- `/oga/settings`

## Where Important Code Lives

If you want to understand the app structure, these are the main places to start.

### App routes

- `src/app`

### Shared UI components

- `src/components`

### Domain rules and constants

- `src/lib/domain`

### Server actions

- `src/lib/server`

### Demo store and seed logic

- `src/lib/server/store`

### Location provider layer

- `src/lib/server/location`

### SQL schema target

- `supabase/migrations/0001_gistmata_mvp.sql`

### Architecture note

- `docs/adr-001-foundation.md`

## Validation And Safety Checks

Use these commands before shipping changes:

```bash
npm run seed
npm run lint
npm run typecheck
npm test
npm run validate
npm run build
```

What they mean:

`npm run seed`

- resets the local demo store

`npm run lint`

- checks code style and common mistakes

`npm run typecheck`

- checks TypeScript correctness

`npm test`

- runs lightweight automated tests

`npm run validate`

- runs a script that tests important business flows directly

`npm run build`

- checks that the production app build succeeds

## What `npm run validate` Covers

The validation script currently checks:

- referral-gated join
- session creation
- Drop Gist with location provider resolution
- comment flow
- report gist flow
- trust queue summary
- survey vote
- oga survey creation
- oga referral generation
- oga protected data bundle

## Supabase Status In This Repo

Supabase is already represented in two ways:

- a production schema contract in SQL
- environment variable support in the codebase

But the full runtime repository is **not** fully switched over yet.

That means:

- the app can be demoed immediately
- the schema direction is already clear
- a later migration to real Supabase-backed runtime data is straightforward

## Important Limitations Right Now

These are known and intentional for the current MVP foundation:

- the app still defaults to the local demo store
- full live Supabase runtime persistence is not finished
- the Google location provider is still a placeholder
- moderation is rule-based, not advanced AI moderation
- alert read-state is still simple
- browser-level end-to-end tests are not added yet

## Recommended Next Steps

If you want to turn this from strong MVP foundation into fuller production implementation, the next highest-value steps are:

1. Replace the demo store with a full Supabase repository implementation behind the same server-store contract.
2. Add a real reverse-geocoding provider and proper caching.
3. Finish read-state, moderation adjudication, and more complete trust operations.
4. Add Playwright end-to-end coverage for join, recovery, Drop Gist, and oga moderation.
5. Move from seeded-only demo behavior to real persisted platform activity.

## Final Summary

This repo is already a serious MVP foundation.

It gives you:

- the product language
- the app structure
- the seed data
- the basic trust model
- the pseudonymous auth/session model
- the oga operations foundation
- a mobile-first reading experience

It is strong enough to demo, iterate on, and continue building from without having to restart the project architecture.
