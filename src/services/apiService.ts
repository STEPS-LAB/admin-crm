import { DEFAULT_API_RATE_LIMIT_PER_MINUTE } from "@/constants/api";
import { generateApiKey } from "@/lib/api/apiKeys";
import {
  countApiKeysByStatus,
  findApiKeys,
  insertApiKey,
  revokeApiKeyRecord,
} from "@/repositories/apiKeyRepository";
import { findSettings } from "@/repositories/settingsRepository";
import { countWebhookEndpoints } from "@/repositories/webhookRepository";
import { getAuthenticatedUser } from "@/lib/auth/cachedAuthenticatedUser";
import { recordEntityCreate, recordEntityUpdate } from "@/services/historyService";

import type { AuthUser } from "@/types/auth";
import type {
  ApiCenterOverview,
  ApiKeyListItem,
  CreateApiKeyInput,
  CreateApiKeyResult,
} from "@/types/api";
import type { HistoryMutationContext } from "@/services/historyService";

async function requireAuthenticatedUser(): Promise<AuthUser> {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}

function sanitizeHistoryKey(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...data };
  delete sanitized.keyHash;
  delete sanitized.plainTextKey;
  return sanitized;
}

export async function getApiCenterOverview(): Promise<ApiCenterOverview> {
  const user = await requireAuthenticatedUser();

  const [activeKeyCount, revokedKeyCount, webhookEndpointCount, settings] = await Promise.all([
    countApiKeysByStatus(user.id, "active"),
    countApiKeysByStatus(user.id, "revoked"),
    countWebhookEndpoints(user.id),
    findSettings(),
  ]);

  return {
    activeKeyCount,
    revokedKeyCount,
    totalKeyCount: activeKeyCount + revokedKeyCount,
    webhookEndpointCount,
    rateLimitPerMinute: settings?.rateLimitApiPerMinute ?? DEFAULT_API_RATE_LIMIT_PER_MINUTE,
    internalApiStatus: "active",
    publicApiStatus: "active",
    webhookStatus: "active",
  };
}

export async function listApiKeys(): Promise<ApiKeyListItem[]> {
  const user = await requireAuthenticatedUser();

  return findApiKeys(user.id);
}

export async function createApiKey(
  input: CreateApiKeyInput,
  context: HistoryMutationContext,
): Promise<CreateApiKeyResult> {
  const user = await requireAuthenticatedUser();
  const generated = generateApiKey();

  const created = await insertApiKey({
    profileId: user.id,
    name: input.name,
    keyPrefix: generated.prefix,
    keyHash: generated.hash,
    scopes: input.scopes,
    expiresAt: input.expiresAt ?? null,
  });

  await recordEntityCreate(
    "system",
    created.id,
    `API key "${created.name}" created`,
    sanitizeHistoryKey({
      id: created.id,
      name: created.name,
      keyPrefix: created.keyPrefix,
      scopes: created.scopes,
      status: created.status,
      expiresAt: created.expiresAt,
    }),
    context,
  );

  return {
    id: created.id,
    name: created.name,
    keyPrefix: created.keyPrefix,
    scopes: created.scopes,
    plainTextKey: generated.fullKey,
    expiresAt: created.expiresAt,
    createdAt: created.createdAt,
  };
}

export async function revokeApiKey(
  apiKeyId: string,
  context: HistoryMutationContext,
): Promise<ApiKeyListItem> {
  const user = await requireAuthenticatedUser();
  const revoked = await revokeApiKeyRecord(user.id, apiKeyId);

  if (!revoked) {
    throw new Error("API key not found or already revoked");
  }

  await recordEntityUpdate(
    "system",
    revoked.id,
    `API key "${revoked.name}" revoked`,
    sanitizeHistoryKey({
      id: revoked.id,
      name: revoked.name,
      keyPrefix: revoked.keyPrefix,
      scopes: revoked.scopes,
      status: "active",
    }),
    sanitizeHistoryKey({
      id: revoked.id,
      name: revoked.name,
      keyPrefix: revoked.keyPrefix,
      scopes: revoked.scopes,
      status: revoked.status,
      revokedAt: revoked.revokedAt,
    }),
    context,
  );

  return revoked;
}
