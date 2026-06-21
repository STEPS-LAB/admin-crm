import { consumeRateLimit } from "@/lib/security/rateLimiter";
import { findSettings } from "@/repositories/settingsRepository";

const SERVER_ACTION_RATE_LIMIT_WINDOW_MS = 60_000;

export type ServerActionRateLimitBucket =
  | "settings"
  | "upload"
  | "search"
  | "import"
  | "export";

export class ServerActionRateLimitedError extends Error {
  constructor(message = "Too many requests. Please wait and try again.") {
    super(message);
    this.name = "ServerActionRateLimitedError";
  }
}

function buildRateLimitKey(bucket: ServerActionRateLimitBucket, actorId: string): string {
  return `server-action:${bucket}:${actorId}`;
}

async function resolveRateLimit(bucket: ServerActionRateLimitBucket): Promise<number> {
  const settings = await findSettings();

  switch (bucket) {
    case "settings":
      return settings?.rateLimitSettingsPerMinute ?? 20;
    case "upload":
      return settings?.rateLimitUploadPerMinute ?? 30;
    case "search":
      return settings?.rateLimitSearchPerMinute ?? 60;
    case "import":
      return settings?.rateLimitImportPerMinute ?? 10;
    case "export":
      return settings?.rateLimitExportPerMinute ?? 10;
    default: {
      const exhaustiveCheck: never = bucket;
      return exhaustiveCheck;
    }
  }
}

export function enforceRateLimitForActor(
  bucket: ServerActionRateLimitBucket,
  actorId: string,
  limit: number,
): void {
  const rateLimit = consumeRateLimit(
    buildRateLimitKey(bucket, actorId),
    limit,
    SERVER_ACTION_RATE_LIMIT_WINDOW_MS,
  );

  if (!rateLimit.allowed) {
    throw new ServerActionRateLimitedError();
  }
}

export async function enforceServerActionRateLimit(
  bucket: ServerActionRateLimitBucket,
  actorId: string | null,
): Promise<void> {
  if (!actorId) {
    throw new ServerActionRateLimitedError("Authentication required");
  }

  const limit = await resolveRateLimit(bucket);
  enforceRateLimitForActor(bucket, actorId, limit);
}
