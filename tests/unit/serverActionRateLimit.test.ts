import { afterEach, describe, expect, it, vi } from "vitest";

import { isCronRequestAuthorized } from "@/lib/internal/cronAuth";
import {
  enforceRateLimitForActor,
  ServerActionRateLimitedError,
} from "@/lib/security/serverActionRateLimit";
import { resetRateLimitStore } from "@/lib/security/rateLimiter";

describe("isCronRequestAuthorized", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects requests without a configured secret", () => {
    vi.stubEnv("CRON_SECRET", "");

    const request = new Request("https://example.com/api/internal/cron/webhooks", {
      headers: {
        Authorization: "Bearer test-secret",
      },
    });

    expect(isCronRequestAuthorized(request)).toBe(false);
  });

  it("accepts bearer tokens that match CRON_SECRET", () => {
    vi.stubEnv("CRON_SECRET", "cron-test-secret");

    const request = new Request("https://example.com/api/internal/cron/webhooks", {
      headers: {
        Authorization: "Bearer cron-test-secret",
      },
    });

    expect(isCronRequestAuthorized(request)).toBe(true);
  });
});

describe("enforceRateLimitForActor", () => {
  afterEach(() => {
    resetRateLimitStore();
  });

  it("blocks settings requests after the configured limit is exceeded", () => {
    const actorId = "profile-rate-limit-test";

    enforceRateLimitForActor("settings", actorId, 2);
    enforceRateLimitForActor("settings", actorId, 2);

    expect(() => enforceRateLimitForActor("settings", actorId, 2)).toThrow(
      ServerActionRateLimitedError,
    );
  });

  it("blocks search requests after the configured limit is exceeded", () => {
    const actorId = "profile-search-rate-limit-test";

    enforceRateLimitForActor("search", actorId, 2);
    enforceRateLimitForActor("search", actorId, 2);

    expect(() => enforceRateLimitForActor("search", actorId, 2)).toThrow(
      ServerActionRateLimitedError,
    );
  });

  it("blocks export requests after the configured limit is exceeded", () => {
    const actorId = "profile-export-rate-limit-test";

    enforceRateLimitForActor("export", actorId, 1);

    expect(() => enforceRateLimitForActor("export", actorId, 1)).toThrow(
      ServerActionRateLimitedError,
    );
  });
});
