---
name: Retirepro drizzle push TTY issue
description: drizzle-kit push fails with TTY error in CI/post-merge because it prompts interactively for data-affecting migrations; tables applied via executeSql instead.
---

## Rule
Never rely on `drizzle-kit push` in non-interactive scripts for this project. Always apply structural changes (new tables, constraints) directly via `executeSql` in code_execution, then update `schema.ts` to stay in sync.

**Why:** drizzle-kit v0.31+ requires TTY to confirm destructive schema changes (e.g. adding a unique constraint to a table with existing rows). The post-merge setup script runs in a non-TTY shell so it fails at the prompt. The `leads_phone_unique` constraint and the `subscribers` table were both applied via direct SQL (`ALTER TABLE` / `CREATE TABLE IF NOT EXISTS`) and NOT through drizzle migrations.

**How to apply:** When adding a new table or constraint:
1. Run the raw SQL via `executeSql` in code_execution
2. Update `lib/db/src/schema/schema.ts` to match
3. Run `pnpm run typecheck:libs` to rebuild declarations
4. Do NOT run `pnpm --filter @workspace/db run push` — it will fail the post-merge script with TTY errors
