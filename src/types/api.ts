import type { ApiKeyStatus, ApiScope } from "@/constants/api";

export interface ApiKeyListItem {
  readonly id: string;
  readonly name: string;
  readonly keyPrefix: string;
  readonly scopes: readonly ApiScope[];
  readonly status: ApiKeyStatus;
  readonly lastUsedAt: Date | null;
  readonly expiresAt: Date | null;
  readonly revokedAt: Date | null;
  readonly createdAt: Date;
}

export interface CreateApiKeyInput {
  readonly name: string;
  readonly scopes: readonly ApiScope[];
  readonly expiresAt?: Date | null;
}

export interface CreateApiKeyResult {
  readonly id: string;
  readonly name: string;
  readonly keyPrefix: string;
  readonly scopes: readonly ApiScope[];
  readonly plainTextKey: string;
  readonly expiresAt: Date | null;
  readonly createdAt: Date;
}

export interface ApiCenterOverview {
  readonly activeKeyCount: number;
  readonly revokedKeyCount: number;
  readonly totalKeyCount: number;
  readonly webhookEndpointCount: number;
  readonly rateLimitPerMinute: number;
  readonly internalApiStatus: "active";
  readonly publicApiStatus: "active" | "prepared";
  readonly webhookStatus: "active" | "prepared";
}
