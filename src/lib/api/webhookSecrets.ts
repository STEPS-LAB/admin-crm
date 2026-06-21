import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

import { WEBHOOK_SECRET_PREFIX } from "@/constants/api";

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

export interface GeneratedWebhookSecret {
  readonly fullSecret: string;
  readonly prefix: string;
  readonly ciphertext: string;
}

function resolveEncryptionKey(): Buffer {
  const configured = process.env.WEBHOOK_ENCRYPTION_KEY?.trim();

  if (configured) {
    return createHash("sha256").update(configured).digest();
  }

  const fallbackSource =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    process.env.DATABASE_URL?.trim() ??
    "admin-crm-development-webhook-key";

  return createHash("sha256").update(fallbackSource).digest();
}

export function generateWebhookSecret(): GeneratedWebhookSecret {
  const random = randomBytes(24).toString("base64url");
  const fullSecret = `${WEBHOOK_SECRET_PREFIX}${random}`;

  return {
    fullSecret,
    prefix: fullSecret.slice(0, 12),
    ciphertext: encryptWebhookSecret(fullSecret),
  };
}

export function encryptWebhookSecret(secret: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, resolveEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decryptWebhookSecret(ciphertext: string): string {
  const buffer = Buffer.from(ciphertext, "base64");
  const iv = buffer.subarray(0, IV_LENGTH);
  const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = buffer.subarray(IV_LENGTH + 16);
  const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, resolveEncryptionKey(), iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
