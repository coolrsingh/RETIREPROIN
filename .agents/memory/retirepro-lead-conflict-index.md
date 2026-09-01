---
name: Lead phone conflict indexes
description: The database requirement that keeps phone-keyed lead re-engagement upserts valid.
---

## Rule
Any index intended to support a PostgreSQL `ON CONFLICT (phone)` lead upsert must be unique. A non-unique B-tree can speed ordinary lookups but cannot act as the conflict arbiter.

**Why:** The re-engagement path depends on a repeated phone updating the existing lead. Without a unique constraint or unique index, PostgreSQL rejects the upsert instead of performing the update.

**How to apply:** Keep the deployment migration and Drizzle schema aligned on a unique phone arbiter. If legacy duplicate phones prevent creating it, fail the migration clearly instead of continuing with an invalid upsert dependency.