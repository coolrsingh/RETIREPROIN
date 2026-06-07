# RetirePro

A retirement planning web app that helps users create personalized retirement plans with visual projections, financial calculations, and professional insights.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind v3, Wouter, React Query, Recharts
- API: Express 5 with Replit Auth (OpenID Connect / passport)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Build: esbuild (ESM bundle)

## Where things live

- `artifacts/retirepro-web/` — React/Vite frontend (previewPath: `/`)
- `artifacts/api-server/` — Express API backend (previewPath: `/api`)
- `lib/db/src/schema/schema.ts` — DB schema (source of truth for all tables)
- `artifacts/api-server/src/routes/routes.ts` — all API route handlers
- `artifacts/api-server/src/storage.ts` — DB storage layer
- `artifacts/api-server/src/calculations.ts` — retirement calculation engine
- `artifacts/retirepro-web/src/lib/sharedSchema.ts` — client-side zod schemas (quickPlanSchema)

## Architecture decisions

- Routes use `registerRoutes(app)` pattern (not Express Router) because auth setup requires direct app-level middleware (passport, express-session)
- `@shared/schema` alias in vite.config.ts points to `src/lib/sharedSchema.ts` — keeps zod schemas in the frontend without importing from `@workspace/db` (which triggers DB connection)
- `memoizee` replaced with inline TTL memoize in `replitAuth.ts` (memoizee has a transitive dep blocked by Replit's package firewall)
- `lib/db` uses `drizzle-orm/node-postgres` with `pg` package; api-server re-exports `db` and `pool` from `@workspace/db`
- Tailwind v3 (not v4) — original app used `@tailwind base/components/utilities` directives

## Product

RetirePro lets users create retirement plans in under 60 seconds via a Quick Plan form. Features:
- Quick Plan wizard with household, income, expenses, assets, children, loans
- Detailed retirement projections with year-by-year charts (Recharts)
- PDF + Excel export
- Admin CRM with configurable planning defaults
- Lead capture for advisor follow-up
- Replit Auth (Google/GitHub login)
- Premium upgrade flow with plan count limits

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do NOT import from `@workspace/db` in frontend code — it triggers the DB connection pool at import time
- `pnpm run dev` at workspace root will fail — run workflows via `restart_workflow` instead
- The api-server's `SESSION_SECRET` env var must be set for Replit Auth sessions to work in production
- `zod/v4` subpath requires `zod` to be explicitly listed in the api-server's dependencies (not just in lib/db)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
