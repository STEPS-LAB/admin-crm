import { and, count, desc, eq, type SQL } from "drizzle-orm";

import { getDb } from "@/db/client";
import { apiKeys } from "@/db/schema/api";

import type { ApiKeyStatus, ApiScope } from "@/constants/api";
import type { ApiKeyListItem } from "@/types/api";

function mapApiKeyRow(row: {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[] | null;
  status: ApiKeyStatus;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
}): ApiKeyListItem {
  return {
    id: row.id,
    name: row.name,
    keyPrefix: row.keyPrefix,
    scopes: (row.scopes ?? []) as ApiScope[],
    status: row.status,
    lastUsedAt: row.lastUsedAt,
    expiresAt: row.expiresAt,
    revokedAt: row.revokedAt,
    createdAt: row.createdAt,
  };
}

function profileScope(profileId: string): SQL {
  return eq(apiKeys.profileId, profileId);
}

export async function findApiKeys(profileId: string): Promise<ApiKeyListItem[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      scopes: apiKeys.scopes,
      status: apiKeys.status,
      lastUsedAt: apiKeys.lastUsedAt,
      expiresAt: apiKeys.expiresAt,
      revokedAt: apiKeys.revokedAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(profileScope(profileId))
    .orderBy(desc(apiKeys.createdAt));

  return rows.map(mapApiKeyRow);
}

export async function countApiKeysByStatus(
  profileId: string,
  status: ApiKeyStatus,
): Promise<number> {
  const db = getDb();

  const [row] = await db
    .select({ total: count() })
    .from(apiKeys)
    .where(and(profileScope(profileId), eq(apiKeys.status, status)));

  return Number(row?.total ?? 0);
}

export async function insertApiKey(input: {
  profileId: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  scopes: readonly ApiScope[];
  expiresAt: Date | null;
}): Promise<ApiKeyListItem & { plainTextKey?: never }> {
  const db = getDb();

  const [row] = await db
    .insert(apiKeys)
    .values({
      profileId: input.profileId,
      name: input.name,
      keyPrefix: input.keyPrefix,
      keyHash: input.keyHash,
      scopes: [...input.scopes],
      expiresAt: input.expiresAt,
    })
    .returning({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      scopes: apiKeys.scopes,
      status: apiKeys.status,
      lastUsedAt: apiKeys.lastUsedAt,
      expiresAt: apiKeys.expiresAt,
      revokedAt: apiKeys.revokedAt,
      createdAt: apiKeys.createdAt,
    });

  if (!row) {
    throw new Error("Failed to create API key");
  }

  return mapApiKeyRow(row);
}

export async function revokeApiKeyRecord(
  profileId: string,
  apiKeyId: string,
): Promise<ApiKeyListItem | null> {
  const db = getDb();
  const now = new Date();

  const [row] = await db
    .update(apiKeys)
    .set({
      status: "revoked",
      revokedAt: now,
      updatedAt: now,
    })
    .where(and(profileScope(profileId), eq(apiKeys.id, apiKeyId), eq(apiKeys.status, "active")))
    .returning({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      scopes: apiKeys.scopes,
      status: apiKeys.status,
      lastUsedAt: apiKeys.lastUsedAt,
      expiresAt: apiKeys.expiresAt,
      revokedAt: apiKeys.revokedAt,
      createdAt: apiKeys.createdAt,
    });

  return row ? mapApiKeyRow(row) : null;
}

export interface ActiveApiKeyRecord {
  readonly id: string;
  readonly name: string;
  readonly scopes: ApiScope[];
  readonly expiresAt: Date | null;
}

export async function findActiveApiKeyByHash(
  keyHash: string,
): Promise<ActiveApiKeyRecord | null> {
  const db = getDb();

  const [row] = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      scopes: apiKeys.scopes,
      status: apiKeys.status,
      expiresAt: apiKeys.expiresAt,
    })
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.status, "active")))
    .limit(1);

  if (!row) {
    return null;
  }

  if (row.expiresAt && row.expiresAt.getTime() <= Date.now()) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    scopes: (row.scopes ?? []) as ApiScope[],
    expiresAt: row.expiresAt,
  };
}

export async function touchApiKeyLastUsed(apiKeyId: string): Promise<void> {
  const db = getDb();

  await db
    .update(apiKeys)
    .set({
      lastUsedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(apiKeys.id, apiKeyId));
}
