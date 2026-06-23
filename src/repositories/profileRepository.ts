import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { profiles } from "@/db/schema";

import type { AuthUser } from "@/types/auth";

export interface UpsertProfileInput {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly avatarUrl?: string | null;
  readonly locale?: string;
  readonly timezone?: string;
}

export async function findProfileById(id: string): Promise<typeof profiles.$inferSelect | null> {
  const db = getDb();
  const rows = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function findProfileByEmail(
  email: string,
): Promise<typeof profiles.$inferSelect | null> {
  const db = getDb();
  const rows = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
  return rows[0] ?? null;
}

export async function upsertProfile(input: UpsertProfileInput): Promise<AuthUser> {
  const db = getDb();
  const existing = await findProfileById(input.id);

  if (existing) {
    const [updated] = await db
      .update(profiles)
      .set({
        email: input.email,
        displayName: input.displayName,
        avatarUrl: input.avatarUrl ?? existing.avatarUrl,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, input.id))
      .returning();

    if (!updated) {
      throw new Error("Failed to update profile");
    }

    return mapProfileToAuthUser(updated);
  }

  const [created] = await db
    .insert(profiles)
    .values({
      id: input.id,
      email: input.email,
      displayName: input.displayName,
      avatarUrl: input.avatarUrl ?? null,
      locale: input.locale ?? "uk",
      timezone: input.timezone ?? "Europe/Kyiv",
      lastLoginAt: new Date(),
      isActive: true,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create profile");
  }

  return mapProfileToAuthUser(created);
}

export async function updateLastLogin(profileId: string): Promise<void> {
  const db = getDb();
  await db
    .update(profiles)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(profiles.id, profileId));
}

export async function updateProfileLocale(profileId: string, locale: string): Promise<AuthUser | null> {
  const db = getDb();

  const [updated] = await db
    .update(profiles)
    .set({ locale, updatedAt: new Date() })
    .where(eq(profiles.id, profileId))
    .returning();

  if (!updated) {
    return null;
  }

  return mapProfileToAuthUser(updated);
}

function mapProfileToAuthUser(row: typeof profiles.$inferSelect): AuthUser {
  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl,
    locale: row.locale,
    timezone: row.timezone,
    isActive: row.isActive,
  };
}
