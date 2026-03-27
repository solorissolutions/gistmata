# ADR 001: GistMata MVP foundation

## Status
Accepted

## Context
The workspace started as a near-empty folder with a spec document, a logo asset, and a raw mockup. The first shipping slice needed to be real enough to support end-to-end local flows immediately, while still defining a production path toward Supabase-backed persistence.

## Decision
The MVP uses:

- Next.js App Router on TypeScript and Tailwind CSS.
- A server-side file-backed demo datastore in `.data/gistmata-demo-store.json` for deterministic local runs.
- A custom pseudonymous session model with random session tokens hashed in the store and sent through an HTTP-only cookie.
- Zod-validated server actions for join, recovery, Drop Gist, comments, reports, reactions, surveys, and oga operations.
- A location abstraction with a mock reverse-geocoder for local/demo use and a Supabase-ready SQL schema as the production contract.

## Consequences
Positive:

- Local setup is fast and seeded without requiring external infrastructure.
- Product flows can be verified immediately, including referral-gated join and protected oga routes.
- The data contract is explicit and already mirrored in Supabase migration SQL.

Tradeoffs:

- Runtime persistence is demo-local by default, not live Supabase yet.
- Multi-instance concurrency guarantees are intentionally out of scope for this first slice.
- The location provider is mocked until a real reverse-geocoding API key is added.
