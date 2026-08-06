/**
 * Hand-written Zod schemas for endpoints not yet covered by the generated
 * OpenAPI spec.  These are used by zod-validation.ts to catch deploy-time
 * shape mismatches on admin-only pages (leads, subscribers).
 */

import * as zod from "zod";

// ---------------------------------------------------------------------------
// GET /api/leads
// ---------------------------------------------------------------------------

export const ListLeadsResponseItem = zod
  .object({
    id: zod.string(),
    scenarioId: zod.string().nullish(),
    name: zod.string(),
    email: zod.string().nullish(),
    phone: zod.string(),
    utm: zod.unknown().nullish(),
    createdAt: zod.string().nullish(),
    updatedAt: zod.string().nullish(),
  })
  .passthrough();

export const ListLeadsResponse = zod.array(ListLeadsResponseItem);

// ---------------------------------------------------------------------------
// GET /api/subscribers
// ---------------------------------------------------------------------------

export const ListSubscribersResponseItem = zod
  .object({
    id: zod.string(),
    email: zod.string(),
    source: zod.string().nullish(),
    createdAt: zod.string().nullish(),
  })
  .passthrough();

export const ListSubscribersResponse = zod.array(ListSubscribersResponseItem);
