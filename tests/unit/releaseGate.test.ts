import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PREPARED_API_ENDPOINTS,
  PUBLIC_API_OPENAPI_PATH,
  PUBLIC_API_VERSION,
} from "@/constants/api";
import { getPublicApiHealth } from "@/services/publicApiService";

const projectRoot = resolve(import.meta.dirname, "../..");

describe("v1.0 release gate", () => {
  it("exposes only active public API endpoints", () => {
    const inactive = PREPARED_API_ENDPOINTS.filter((endpoint) => endpoint.status !== "active");

    expect(inactive).toEqual([]);
  });

  it("documents the OpenAPI specification endpoint", () => {
    const documented = PREPARED_API_ENDPOINTS.some(
      (endpoint) => endpoint.path === PUBLIC_API_OPENAPI_PATH && endpoint.status === "active",
    );

    expect(documented).toBe(true);
  });

  it("aligns health payload version with the public API version constant", async () => {
    const health = await getPublicApiHealth();
    expect(health.version).toBe(PUBLIC_API_VERSION);
  });

  it("includes release verification and E2E smoke coverage", () => {
    expect(existsSync(resolve(projectRoot, "scripts/verify-release.ts"))).toBe(true);
    expect(existsSync(resolve(projectRoot, "tests/e2e/smoke.spec.ts"))).toBe(true);
    expect(existsSync(resolve(projectRoot, "tests/e2e/public-api.spec.ts"))).toBe(true);
    expect(existsSync(resolve(projectRoot, ".github/workflows/ci.yml"))).toBe(true);
  });
});
