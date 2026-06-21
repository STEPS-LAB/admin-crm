import { describe, expect, it } from "vitest";

import { WEBHOOK_SECRET_PREFIX } from "@/constants/api";
import {
  decryptWebhookSecret,
  encryptWebhookSecret,
  generateWebhookSecret,
} from "@/lib/api/webhookSecrets";
import { signWebhookPayload, verifyWebhookSignature } from "@/lib/api/webhookSigning";
import { computeWebhookRetryDelaySeconds } from "@/lib/webhooks/retrySchedule";
import { buildPublicApiRateLimitHeaders } from "@/lib/api/publicApiRateLimit";

describe("generateWebhookSecret", () => {
  it("creates a decryptable secret", () => {
    const generated = generateWebhookSecret();

    expect(generated.fullSecret.startsWith(WEBHOOK_SECRET_PREFIX)).toBe(true);
    expect(decryptWebhookSecret(generated.ciphertext)).toBe(generated.fullSecret);
  });
});

describe("encryptWebhookSecret", () => {
  it("round-trips secret values", () => {
    const secret = `${WEBHOOK_SECRET_PREFIX}round-trip`;
    const ciphertext = encryptWebhookSecret(secret);

    expect(decryptWebhookSecret(ciphertext)).toBe(secret);
  });
});

describe("signWebhookPayload", () => {
  it("verifies valid signatures", () => {
    const secret = `${WEBHOOK_SECRET_PREFIX}signing-test`;
    const body = JSON.stringify({ event: "product.updated", data: { id: "abc" } });
    const timestamp = 1_700_000_000;
    const signature = signWebhookPayload(secret, timestamp, body);

    expect(verifyWebhookSignature(secret, timestamp, body, `sha256=${signature}`)).toBe(true);
    expect(verifyWebhookSignature(secret, timestamp, body, "sha256=invalid")).toBe(false);
  });
});

describe("computeWebhookRetryDelaySeconds", () => {
  it("applies exponential backoff with a cap", () => {
    expect(computeWebhookRetryDelaySeconds(1, 60)).toBe(60);
    expect(computeWebhookRetryDelaySeconds(2, 60)).toBe(120);
    expect(computeWebhookRetryDelaySeconds(8, 60)).toBe(3_600);
  });
});

describe("buildPublicApiRateLimitHeaders", () => {
  it("serializes rate limit metadata", () => {
    expect(
      buildPublicApiRateLimitHeaders({
        limit: 100,
        remaining: 42,
        resetAt: 1_700_000_500_000,
      }),
    ).toEqual({
      "X-RateLimit-Limit": "100",
      "X-RateLimit-Remaining": "42",
      "X-RateLimit-Reset": "1700000500",
    });
  });
});
