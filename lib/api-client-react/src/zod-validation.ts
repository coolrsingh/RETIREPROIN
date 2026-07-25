/**
 * Wires the generated Zod response schemas from `@workspace/api-zod` into
 * the `customFetch` response validator hook.
 *
 * Call `configureZodValidation(true)` once during app initialisation (e.g.
 * in `main.tsx` / `App.tsx`) to enable runtime response shape checking.
 * Call `configureZodValidation(false)` (or omit the call entirely) to keep
 * the feature disabled — useful for production builds where the performance
 * overhead is undesirable.
 *
 * When a response fails validation a `ResponseValidationError` is thrown
 * instead of silently returning malformed data, so TanStack Query will surface
 * it as an error state rather than passing an ill-shaped object to the UI.
 */

import {
  GetAuthUserResponse,
  ListScenariosResponse,
  CreateScenarioResponse,
  GetScenarioResponse,
  UpdateScenarioResponse,
  DeleteScenarioResponse,
  GetCrmDefaultsResponse,
  UpdateCrmDefaultsResponse,
  CreatePlanQuickResponse,
} from "@workspace/api-zod";
import type { ZodTypeAny } from "zod";
import { setResponseValidator } from "./custom-fetch";

// ---------------------------------------------------------------------------
// URL → Zod schema mapping
// ---------------------------------------------------------------------------
// Each entry maps a (method, URL-pattern) pair to the schema that the server
// should return for that operation.  Patterns are tested in order; the first
// match wins.  A pattern of `null` means "match any URL for this method".
// ---------------------------------------------------------------------------

interface RouteSchema {
  method: string;
  /** Regex matched against the full URL string (including query params). */
  pattern: RegExp;
  schema: ZodTypeAny;
}

const ROUTE_SCHEMAS: RouteSchema[] = [
  // Auth
  { method: "GET", pattern: /\/auth\/user($|\?)/, schema: GetAuthUserResponse },

  // Scenarios — specific routes before the wildcard
  { method: "GET", pattern: /\/scenarios\/[^/?]+($|\?)/, schema: GetScenarioResponse },
  { method: "PUT", pattern: /\/scenarios\/[^/?]+($|\?)/, schema: UpdateScenarioResponse },
  { method: "DELETE", pattern: /\/scenarios\/[^/?]+($|\?)/, schema: DeleteScenarioResponse },
  { method: "GET", pattern: /\/scenarios($|\?)/, schema: ListScenariosResponse },
  { method: "POST", pattern: /\/scenarios($|\?)/, schema: CreateScenarioResponse },

  // CRM defaults
  { method: "GET", pattern: /\/crm\/defaults($|\?)/, schema: GetCrmDefaultsResponse },
  { method: "PUT", pattern: /\/crm\/defaults($|\?)/, schema: UpdateCrmDefaultsResponse },

  // Quick plan
  { method: "POST", pattern: /\/plan\/quick($|\?)/, schema: CreatePlanQuickResponse },
];

// ---------------------------------------------------------------------------
// Validator implementation
// ---------------------------------------------------------------------------

function validateResponse(url: string, method: string, data: unknown): void {
  const upperMethod = method.toUpperCase();

  for (const route of ROUTE_SCHEMAS) {
    if (route.method !== upperMethod) continue;
    if (!route.pattern.test(url)) continue;

    // `parse` throws a ZodError on mismatch; that error propagates up and is
    // wrapped by customFetch into a ResponseValidationError.
    route.schema.parse(data);
    return;
  }
  // No matching route — skip validation rather than throwing for unknown endpoints.
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Enable or disable runtime Zod response validation.
 *
 * @param enabled - When `true` (default) the validator is registered and
 *   every successful API response is checked against its generated Zod schema.
 *   When `false` the validator is removed.
 */
export function configureZodValidation(enabled = true): void {
  setResponseValidator(enabled ? validateResponse : null);
}
