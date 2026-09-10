import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { RequestHandler } from "express";
import type { AddressInfo } from "node:net";

vi.hoisted(() => {
  process.env.DATABASE_URL ??= "postgresql://subscriber-authorization-test";
});

vi.mock("../replitAuth", () => ({
  setupAuth: vi.fn(async () => undefined),
  isAuthenticated: ((req: any, _res: any, next: any) => {
    req.user = { claims: { sub: "authenticated-non-admin" } };
    next();
  }) as RequestHandler,
}));

const storageMocks = vi.hoisted(() => ({
  getUser: vi.fn(async () => ({
    id: "authenticated-non-admin",
    role: "user",
  })),
  getSubscribers: vi.fn(async () => [
    {
      id: "subscriber-1",
      email: "private@example.com",
      source: "blog",
      createdAt: new Date(),
    },
  ]),
}));

vi.mock("../storage", () => ({
  storage: storageMocks,
}));

vi.mock("../db", () => ({
  db: {},
}));

import app from "../app";
import { registerRoutes } from "../routes/routes";

describe("subscriber admin authorization", () => {
  let server: Awaited<ReturnType<typeof registerRoutes>>;
  let baseUrl: string;

  beforeAll(async () => {
    server = await registerRoutes(app);
    await new Promise<void>((resolve, reject) => {
      server.listen(0, "127.0.0.1", () => resolve());
      server.once("error", reject);
    });

    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it("returns 403 without reading subscriber data for an authenticated non-admin", async () => {
    const response = await fetch(`${baseUrl}/api/subscribers`);
    const body = (await response.json()) as { message?: string };

    expect(response.status).toBe(403);
    expect(body).toEqual({ message: "Admin access required" });
    expect(storageMocks.getUser).toHaveBeenCalledWith("authenticated-non-admin");
    expect(storageMocks.getSubscribers).not.toHaveBeenCalled();
  });
});