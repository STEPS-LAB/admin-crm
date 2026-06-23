import { eq } from "drizzle-orm";

import { withDbRetry } from "@/db/client";
import { sessions } from "@/db/schema";

import type { SessionMetadata } from "@/types/auth";

export interface CreateSessionInput {
  readonly profileId: string;
  readonly deviceName?: string | null;
  readonly browser?: string | null;
  readonly operatingSystem?: string | null;
  readonly expiresAt?: Date | null;
}

export async function createSession(input: CreateSessionInput): Promise<SessionMetadata> {
  return withDbRetry(async (db) => {
    const now = new Date();

    const [row] = await db
      .insert(sessions)
      .values({
        profileId: input.profileId,
        deviceName: input.deviceName ?? null,
        browser: input.browser ?? null,
        operatingSystem: input.operatingSystem ?? null,
        lastActivity: now,
        expiresAt: input.expiresAt ?? null,
      })
      .returning();

    if (!row) {
      throw new Error("Failed to create session metadata");
    }

    return mapSession(row);
  });
}

export async function updateSessionActivity(sessionId: string): Promise<void> {
  await touchSessionActivity(sessionId);
}

export async function findSessionById(sessionId: string): Promise<SessionMetadata | null> {
  return withDbRetry(async (db) => {
    const [row] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);

    if (!row) {
      return null;
    }

    return mapSession(row);
  });
}

export async function deleteSession(sessionId: string): Promise<void> {
  await withDbRetry(async (db) => {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  });
}

export async function touchSessionActivity(sessionId: string): Promise<void> {
  await withDbRetry(async (db) => {
    await db.update(sessions).set({ lastActivity: new Date() }).where(eq(sessions.id, sessionId));
  });
}

export async function findSessionsByProfileId(profileId: string): Promise<SessionMetadata[]> {
  return withDbRetry(async (db) => {
    const rows = await db.select().from(sessions).where(eq(sessions.profileId, profileId));
    return rows.map(mapSession);
  });
}

export async function deleteSessionsByProfileId(profileId: string): Promise<void> {
  await withDbRetry(async (db) => {
    await db.delete(sessions).where(eq(sessions.profileId, profileId));
  });
}

function mapSession(row: typeof sessions.$inferSelect): SessionMetadata {
  return {
    id: row.id,
    profileId: row.profileId,
    deviceName: row.deviceName,
    browser: row.browser,
    operatingSystem: row.operatingSystem,
    lastActivity: row.lastActivity,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
  };
}
