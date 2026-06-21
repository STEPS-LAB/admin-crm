import { createHash, randomBytes } from "node:crypto";

import { API_KEY_PREFIX } from "@/constants/api";

export interface GeneratedApiKey {
  readonly fullKey: string;
  readonly prefix: string;
  readonly hash: string;
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function generateApiKey(): GeneratedApiKey {
  const random = randomBytes(24).toString("base64url");
  const fullKey = `${API_KEY_PREFIX}${random}`;

  return {
    fullKey,
    prefix: fullKey.slice(0, 12),
    hash: hashApiKey(fullKey),
  };
}
