import type { ApiScope } from "@/constants/api";
import { extractBearerApiKey, hasApiScope, hashBearerApiKey } from "@/lib/api/publicApiAuth";
import {
  buildPublicApiRateLimitHeaders,
  toPublicApiRateLimitMeta,
} from "@/lib/api/publicApiRateLimit";
import { publicApiError } from "@/lib/api/publicApiResponse";
import { consumeRateLimit } from "@/lib/security/rateLimiter";
import { findActiveApiKeyByHash, touchApiKeyLastUsed } from "@/repositories/apiKeyRepository";
import { findSettings } from "@/repositories/settingsRepository";

import type { ApiKeyAuthContext } from "@/types/public-api";
import type { PublicApiRateLimitMeta } from "@/lib/api/publicApiRateLimit";
import type { NextResponse } from "next/server";

const API_RATE_LIMIT_WINDOW_MS = 60_000;
const FALLBACK_API_RATE_LIMIT_PER_MINUTE = 100;

export interface PublicApiAuthSuccess {
  readonly ok: true;
  readonly context: ApiKeyAuthContext;
  readonly rateLimit: PublicApiRateLimitMeta;
}

export interface PublicApiAuthFailure {
  readonly ok: false;
  readonly response: NextResponse;
}

export type PublicApiAuthResult = PublicApiAuthSuccess | PublicApiAuthFailure;

async function resolveApiRateLimitPerMinute(): Promise<number> {
  const settings = await findSettings();

  return settings?.rateLimitApiPerMinute ?? FALLBACK_API_RATE_LIMIT_PER_MINUTE;
}

export async function authenticatePublicApiRequest(
  request: Request,
  requiredScope: ApiScope,
): Promise<PublicApiAuthResult> {
  const token = extractBearerApiKey(request);

  if (!token) {
    return {
      ok: false,
      response: publicApiError("UNAUTHORIZED", "Valid API key required", 401),
    };
  }

  const keyRecord = await findActiveApiKeyByHash(hashBearerApiKey(token));

  if (!keyRecord) {
    return {
      ok: false,
      response: publicApiError("UNAUTHORIZED", "API key is invalid or revoked", 401),
    };
  }

  if (!hasApiScope(keyRecord.scopes, requiredScope)) {
    return {
      ok: false,
      response: publicApiError("FORBIDDEN", "API key does not include the required scope", 403),
    };
  }

  const rateLimitPerMinute = await resolveApiRateLimitPerMinute();
  const rateLimit = consumeRateLimit(
    `api:${keyRecord.id}`,
    rateLimitPerMinute,
    API_RATE_LIMIT_WINDOW_MS,
  );
  const rateLimitMeta = toPublicApiRateLimitMeta(rateLimitPerMinute, rateLimit);

  if (!rateLimit.allowed) {
    return {
      ok: false,
      response: publicApiError("RATE_LIMITED", "API rate limit exceeded", 429, {
        headers: buildPublicApiRateLimitHeaders(rateLimitMeta),
      }),
    };
  }

  void touchApiKeyLastUsed(keyRecord.id);

  return {
    ok: true,
    context: {
      id: keyRecord.id,
      name: keyRecord.name,
      scopes: keyRecord.scopes,
    },
    rateLimit: rateLimitMeta,
  };
}
