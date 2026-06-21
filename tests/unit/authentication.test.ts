import { beforeEach, describe, expect, it } from "vitest";

import { DEV_TEST_USER } from "@/constants/devTestUser";
import { loginSchema } from "@/schemas/authentication/loginSchema";
import {
  checkRateLimit,
  clearRateLimit,
  recordFailedAttempt,
  resetRateLimitStore,
} from "@/lib/security/rateLimiter";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "admin@example.com",
      password: "SecurePass123!",
      rememberMe: true,
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "SecurePass123!",
      rememberMe: false,
    });

    expect(result.success).toBe(false);
  });

  it("accepts password with minimum length", () => {
    const result = loginSchema.safeParse({
      email: "admin@example.com",
      password: "12345678",
      rememberMe: false,
    });

    expect(result.success).toBe(true);
  });

  it("rejects short passwords", () => {
    const result = loginSchema.safeParse({
      email: "admin@example.com",
      password: "123",
      rememberMe: false,
    });

    expect(result.success).toBe(false);
  });

  it("maps the dev test login alias to the test email", () => {
    const result = loginSchema.safeParse({
      email: DEV_TEST_USER.loginAlias,
      password: DEV_TEST_USER.password,
      rememberMe: false,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.email).toBe(DEV_TEST_USER.email);
    }
  });
});

describe("rateLimiter", () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it("allows requests within the limit", () => {
    const key = "test-key";
    const result = checkRateLimit(key, 3, 60_000);
    expect(result.allowed).toBe(true);
  });

  it("blocks after max failed attempts", () => {
    const key = "blocked-key";

    recordFailedAttempt(key, 2, 60_000);
    recordFailedAttempt(key, 2, 60_000);

    const result = checkRateLimit(key, 2, 60_000);
    expect(result.allowed).toBe(false);
  });

  it("clears rate limit on success", () => {
    const key = "clear-key";
    recordFailedAttempt(key, 2, 60_000);
    clearRateLimit(key);

    const result = checkRateLimit(key, 2, 60_000);
    expect(result.allowed).toBe(true);
  });
});
