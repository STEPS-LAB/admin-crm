import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getServerEnv } from "@/lib/env";

import * as schema from "./schema";

const TRANSIENT_DB_ERROR_CODES = new Set([
  "CONNECT_TIMEOUT",
  "ECONNREFUSED",
  "ECONNRESET",
  "EPIPE",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EMAXCONNSESSION",
]);

function resolvePoolSize(): number {
  if (process.env.VERCEL === "1") {
    return 1;
  }

  return process.env.NODE_ENV === "production" ? 1 : 10;
}

const globalForDb = globalThis as unknown as {
  queryClient: ReturnType<typeof postgres> | undefined;
  dbInstance: ReturnType<typeof drizzle<typeof schema>> | undefined;
};

function createQueryClient(): ReturnType<typeof postgres> {
  const { DATABASE_URL } = getServerEnv();

  return postgres(DATABASE_URL, {
    max: resolvePoolSize(),
    idle_timeout: 20,
    connect_timeout: 30,
    max_lifetime: 60 * 10,
    prepare: false,
  });
}

export function isTransientDbError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const candidates = [error, error.cause];
  return candidates.some(
    (candidate) =>
      candidate instanceof Error &&
      typeof candidate.code === "string" &&
      TRANSIENT_DB_ERROR_CODES.has(candidate.code),
  );
}

export function resetDbPool(): void {
  const queryClient = globalForDb.queryClient;
  globalForDb.queryClient = undefined;
  globalForDb.dbInstance = undefined;

  if (queryClient) {
    void queryClient.end({ timeout: 2 }).catch(() => undefined);
  }
}

export function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!globalForDb.dbInstance) {
    const queryClient = createQueryClient();
    globalForDb.queryClient = queryClient;
    globalForDb.dbInstance = drizzle(queryClient, { schema });
  }

  return globalForDb.dbInstance;
}

export async function withDbRetry<T>(
  operation: (db: ReturnType<typeof getDb>) => Promise<T>,
  retries = 2,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation(getDb());
    } catch (error) {
      lastError = error;

      if (attempt < retries && isTransientDbError(error)) {
        resetDbPool();
        await new Promise((resolve) => {
          setTimeout(resolve, 150 * (attempt + 1));
        });
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

export type Database = ReturnType<typeof getDb>;
