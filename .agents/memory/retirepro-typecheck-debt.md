---
name: Retirepro pre-existing typecheck debt
description: Known, unrelated tsc errors so future agents don't chase them as regressions.
---

`pnpm --filter @workspace/retirepro-web run typecheck` and `... @workspace/api-server run typecheck` both report pre-existing errors NOT caused by recent feature work:
- web: `plan-dashboard.tsx`, `plan-form.tsx` (`@shared/schema` path only aliased in vite.config, not tsconfig), `settings-crm.tsx` — react-query `useQuery` data typed as `{}`.
- api-server: `routes.ts` — Zod v4 `ZodError.errors` (should be `.issues`) and several "Not all code paths return a value".

**How to apply:** when verifying a change, confirm your edited files are absent from the error list rather than expecting a clean full typecheck. Dev servers run via tsx/esbuild and are unaffected by these `tsc --noEmit` errors.
