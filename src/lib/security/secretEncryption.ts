import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function resolveEncryptionKey(): Buffer {
  const configured =
    process.env.SETTINGS_ENCRYPTION_KEY?.trim() ??
    process.env.BACKUP_ENCRYPTION_KEY?.trim() ??
    process.env.WEBHOOK_ENCRYPTION_KEY?.trim();

  if (configured) {
    return createHash("sha256").update(configured).digest();
  }

  const fallbackSource =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    process.env.DATABASE_URL?.trim() ??
    "admin-crm-development-settings-key";

  return createHash("sha256").update(fallbackSource).digest();
}

export function encryptSecret(value: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, resolveEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decryptSecret(value: string): string {
  const buffer = Buffer.from(value, "base64");
  const iv = buffer.subarray(0, IV_LENGTH);
  const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = buffer.subarray(IV_LENGTH + 16);
  const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, resolveEncryptionKey(), iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export function maskSecret(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return "••••••••";
}
