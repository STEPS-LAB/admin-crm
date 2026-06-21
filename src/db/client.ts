import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getServerEnv } from "@/lib/env";

import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  queryClient: ReturnType<typeof postgres> | undefined;
};

function createQueryClient(): ReturnType<typeof postgres> {
  const { DATABASE_URL } = getServerEnv();

  return postgres(DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!dbInstance) {
    const queryClient = globalForDb.queryClient ?? createQueryClient();

    if (process.env.NODE_ENV !== "production") {
      globalForDb.queryClient = queryClient;
    }

    dbInstance = drizzle(queryClient, { schema });
  }

  return dbInstance;
}

export type Database = ReturnType<typeof getDb>;
