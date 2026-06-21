import { expect, test } from "@playwright/test";

import { hasE2eDatabase, publicApiHealthPath, publicOpenApiPath } from "./helpers/env";

test.describe("Public API v1", () => {
  test("health endpoint returns ok without authentication", async ({ request }) => {
    const response = await request.get(publicApiHealthPath);
    expect(response.ok()).toBe(true);

    const body = (await response.json()) as {
      success: boolean;
      data: { status: string; version: string; timestamp: string };
    };

    expect(body.success).toBe(true);
    expect(body.data.status).toBe("ok");
    expect(body.data.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(body.data.timestamp).toBeTruthy();
  });

  test("protected catalog endpoint rejects missing API key", async ({ request }) => {
    const response = await request.get("/api/v1/products");
    expect(response.status()).toBe(401);

    const body = (await response.json()) as {
      success: boolean;
      error: { code: string; message: string };
    };

    expect(body.success).toBe(false);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  test("openapi specification is available when database is configured", async ({ request }) => {
    test.skip(!hasE2eDatabase, "Set RUN_E2E_DB=true with a live DATABASE_URL to run DB-backed E2E");

    const response = await request.get(publicOpenApiPath);
    expect(response.ok()).toBe(true);

    const body = (await response.json()) as {
      openapi: string;
      info: { title: string; version: string };
      paths: Record<string, unknown>;
    };

    expect(body.openapi).toBe("3.1.0");
    expect(body.info.title).toContain("Public API");
    expect(body.paths["/api/v1/health"]).toBeTruthy();
    expect(body.paths["/api/v1/products"]).toBeTruthy();
  });
});
