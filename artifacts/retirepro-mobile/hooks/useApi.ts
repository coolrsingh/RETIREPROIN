/**
 * Mobile API fetch utility with optional Zod response validation.
 *
 * Call `configureZodValidation(true)` once at app startup (e.g. in `_layout.tsx`)
 * to enable runtime shape checking.  Call `configureZodValidation(false)` or
 * omit the call to keep validation disabled — useful for production builds
 * where the overhead is undesirable.
 *
 * When a response fails validation a descriptive `ResponseValidationError` is
 * thrown so TanStack Query surfaces it as an error state rather than passing an
 * ill-shaped object to the UI.
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

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

export class ResponseValidationError extends Error {
  constructor(
    public readonly url: string,
    public readonly method: string,
    public readonly cause: unknown,
  ) {
    const causeMsg =
      cause instanceof Error ? cause.message : String(cause);
    super(
      `API response validation failed for ${method} ${url}: ${causeMsg}`,
    );
    this.name = "ResponseValidationError";
  }
}

// ---------------------------------------------------------------------------
// Route → schema mapping (mirrors lib/api-client-react/src/zod-validation.ts)
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
// Validation toggle
// ---------------------------------------------------------------------------

let _validationEnabled = false;

/**
 * Enable or disable runtime Zod response validation for mobile API calls.
 *
 * @param enabled - `true` (default) to validate responses; `false` to skip.
 */
export function configureZodValidation(enabled = true): void {
  _validationEnabled = enabled;
}

function validateResponse(url: string, method: string, data: unknown): void {
  if (!_validationEnabled) return;

  const upperMethod = method.toUpperCase();

  for (const route of ROUTE_SCHEMAS) {
    if (route.method !== upperMethod) continue;
    if (!route.pattern.test(url)) continue;

    // parse throws ZodError on mismatch; we catch and re-wrap below.
    route.schema.parse(data);
    return;
  }
  // No matching route — skip validation rather than throwing for unknown endpoints.
}

// ---------------------------------------------------------------------------
// Core fetch helper
// ---------------------------------------------------------------------------

const getBaseUrl = () => {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;
  return "";
};

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const base = getBaseUrl();
  const url = `${base}${path}`;
  const method = options?.method ?? "GET";

  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Request failed");
    throw Object.assign(new Error(text), { status: res.status });
  }

  const data = await res.json();

  try {
    validateResponse(url, method, data);
  } catch (cause) {
    throw new ResponseValidationError(url, method, cause);
  }

  return data as T;
}
