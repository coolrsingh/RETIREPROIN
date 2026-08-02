#!/bin/bash
set -e
pnpm install --frozen-lockfile
psql "$DATABASE_URL" -f scripts/migrate.sql
pnpm --filter @workspace/api-client-react run build
