---
name: Retirepro monorepo tsc project-reference dist folders
description: Why editing lib/db or lib/api-zod schemas can silently not show up in api-server/web tsc errors, and how to fix it.
---

`lib/db` and `lib/api-zod` are TS "composite" project-reference packages with `emitDeclarationOnly: true` and a checked-in `dist/*.d.ts` output (see the api-client-react rebuild task for the same pattern in another lib). Consumers (`artifacts/api-server`, `artifacts/retirepro-web`) resolve `@workspace/db` etc. through `package.json` "exports" pointing at `./src/index.ts`, but `tsc --noEmit -p .` in a referencing project still validates the referenced project's `dist/*.d.ts` is up to date with its `.ts` source — if `dist` is stale (edited schema.ts but never rebuilt), you get **stale/incomplete inferred types with no error** pointing at the real cause, just confusing "property does not exist" errors downstream in the consumer.

**Why:** Cost significant back-and-forth once — deleting the referenced project's `.tsbuildinfo` alone did not fix it, and deleting its `dist` folder outright made things worse (`TS6305: Output file has not been built from source file`) because these dist folders are hand-maintained build artifacts, not disposable caches.

**How to apply:** After editing a schema/type in `lib/db` or `lib/api-zod`, rebuild its declarations before trusting a consumer's `tsc --noEmit` output: `npx tsc --build lib/db lib/api-zod --force` (safe to run both together). Do this whenever downstream tsc errors mention properties you just added not existing, or the object type shown looks like it's missing your newest fields.
