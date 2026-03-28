# GistMata Split Deployment

This repo now supports two separate Next.js deployments:

- public app from the repo root
- operator app from `apps/oga`

Both apps read and write the same backend truth through the shared service layer in `src/lib/server`.

## Public app

Deploy the repo root as the public app.

Required env:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `OGA_APP_ORIGIN`

Set `OGA_APP_ORIGIN` to the standalone operator deployment, for example:

- testing: `https://oga.gistmata.vercel.app`
- final: `https://oga.gistmata.com`

When `OGA_APP_ORIGIN` is set, public `/oga`, `/oga-v2`, and `/oga-login` requests redirect to the standalone operator app instead of serving the dashboard from the public route tree.
Shared auth actions also send authenticated OGA users to the standalone operator origin after login or recovery.

## Operator app

Deploy `apps/oga` as a separate Vercel project.

Required env:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `DATABASE_URL`
- `DIRECT_URL`

Optional env:

- `SESSION_POOLER_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `LOCATION_PROVIDER`
- `GOOGLE_MAPS_API_KEY`

The operator app reuses the existing `oga-v2` surface under its own deployment. The operator entrypoint is:

- `/login`
- `/recovery`
- `/oga-v2`

Legacy compatibility aliases are still available inside the operator app:

- `/oga-login`
- `/locker/recovery`

## Local development

From the repo root:

```bash
npm install
npm run dev
npm run dev:oga
```

Suggested local env:

- public app `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- public app `OGA_APP_ORIGIN=http://localhost:3001`
- operator app `NEXT_PUBLIC_APP_URL=http://localhost:3001`
- operator app `NEXT_PUBLIC_PUBLIC_APP_URL=http://localhost:3000`

## Notes

- The old public `/oga` and `/oga-v2` code still exists temporarily for compatibility, but production traffic should be redirected to the standalone operator deployment.
- Keep the legacy public operator tree only until the standalone operator deployment is live and verified on its own project/domain. Remove or disable the public tree after that verification passes.
- The shared backend truth remains the same Supabase/Postgres database for both apps.
- `npm run oga:ensure` verifies the canonical operator account in the shared database.
