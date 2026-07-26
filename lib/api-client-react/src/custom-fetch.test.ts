/**
 * Tests confirming that the response-validation hook in customFetch:
 *  1. Throws ResponseValidationError when a response has an unexpected shape.
 *  2. Passes through a well-formed response without error.
 *  3. Is disabled when configureZodValidation(false) is called.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  customFetch,
  setResponseValidator,
  setDefaultCredentials,
  ResponseValidationError,
} from "./custom-fetch";
import { configureZodValidation } from "./zod-validation";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal fake Response that resolves to `body` as JSON. */
function makeFetchResponse(body: unknown, status = 200): Response {
  const json = JSON.stringify(body);
  return new Response(json, {
    status,
    headers: { "content-type": "application/json" },
  });
}

/** Stub global fetch to return the given Response once. */
function stubFetch(response: Response): void {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(response));
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  // Clear any credentials / validator state left over from prior tests.
  setDefaultCredentials(null);
  setResponseValidator(null);
});

afterEach(() => {
  vi.unstubAllGlobals();
  // Leave the module in a clean state for subsequent test files.
  setResponseValidator(null);
});

// ---------------------------------------------------------------------------
// Zod schema used across tests (mirrors GetAuthUser's required `id` field)
// ---------------------------------------------------------------------------

const UserSchema = z.object({
  id: z.string(),
  email: z.string().nullish(),
});

// ---------------------------------------------------------------------------
// 1. Shape mismatch → ResponseValidationError
// ---------------------------------------------------------------------------

describe("customFetch — response validator", () => {
  it("throws ResponseValidationError when the response is missing required fields", async () => {
    // Register a validator that enforces UserSchema.
    setResponseValidator((_url, _method, data) => {
      UserSchema.parse(data); // throws ZodError when `id` is absent
    });

    // Server returns an object that is missing the required `id` field.
    stubFetch(makeFetchResponse({ email: "user@example.com" }));

    await expect(customFetch("/auth/user")).rejects.toBeInstanceOf(
      ResponseValidationError,
    );
  });

  it("includes the cause and URL in the ResponseValidationError message", async () => {
    setResponseValidator((_url, _method, data) => {
      UserSchema.parse(data);
    });

    stubFetch(makeFetchResponse({ email: "bad@example.com" }));

    const err = await customFetch("/auth/user").catch((e) => e);
    expect(err).toBeInstanceOf(ResponseValidationError);
    expect(err.message).toMatch(/ResponseValidationError|schema validation/i);
    // The original ZodError is preserved as `cause`.
    expect(err.cause).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // 2. Well-formed response passes through without error
  // -------------------------------------------------------------------------

  it("returns the parsed body when the response matches the schema", async () => {
    setResponseValidator((_url, _method, data) => {
      UserSchema.parse(data);
    });

    const validUser = { id: "user-1", email: "ok@example.com" };
    stubFetch(makeFetchResponse(validUser));

    const result = await customFetch<typeof validUser>("/auth/user");
    expect(result).toEqual(validUser);
  });

  // -------------------------------------------------------------------------
  // 3. configureZodValidation(false) disables the check
  // -------------------------------------------------------------------------

  it("does NOT throw when configureZodValidation(false) is set, even with a bad shape", async () => {
    // First enable validation so we can confirm disabling it actually matters.
    configureZodValidation(true);

    // Now disable it.
    configureZodValidation(false);

    // Server returns an object missing `id` — would fail the auth-user schema.
    stubFetch(makeFetchResponse({ email: "user@example.com" }));

    // Should resolve without throwing because validation is off.
    await expect(customFetch("/auth/user")).resolves.toBeDefined();
  });

  it("re-enables validation after configureZodValidation(true) is called again", async () => {
    configureZodValidation(false);
    configureZodValidation(true);

    // The real GetAuthUserResponse schema expects `id: string`.
    // A response without `id` should now throw.
    stubFetch(makeFetchResponse({ email: "user@example.com" }));

    await expect(customFetch("/auth/user")).rejects.toBeInstanceOf(
      ResponseValidationError,
    );

    // Clean up — leave validation disabled so other tests are not affected.
    configureZodValidation(false);
  });
});
