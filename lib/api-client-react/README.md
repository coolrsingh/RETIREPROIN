# @workspace/api-client-react

Generated React Query hooks and the `customFetch` layer that validates API response shapes at runtime via Zod.

## Running the tests

```bash
# From the repo root
pnpm --filter @workspace/api-client-react test

# Or via the root-level test script (also runs in CI)
pnpm test
```

Tests live in `src/custom-fetch.test.ts` and cover:
- Shape-mismatch responses throw `ResponseValidationError`
- Well-formed responses pass through untouched
- `configureZodValidation(false)` disables the check
