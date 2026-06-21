import { config } from "dotenv";
import { eq } from "drizzle-orm";

import { DEV_TEST_USER, DEV_TEST_USER_ID } from "@/constants/devTestUser";
import { getDb } from "@/db/client";
import { profiles } from "@/db/schema";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/admin";

config({ path: ".env.local" });
config();

async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw new Error(`Failed to list auth users: ${error.message}`);
  }

  const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
  return match?.id ?? null;
}

async function ensureAuthUser(): Promise<string> {
  const supabase = createAdminClient();
  const existingId = await findAuthUserIdByEmail(DEV_TEST_USER.email);

  if (existingId) {
    const { error } = await supabase.auth.admin.updateUserById(existingId, {
      password: DEV_TEST_USER.password,
      email_confirm: true,
      user_metadata: {
        display_name: DEV_TEST_USER.displayName,
      },
    });

    if (error) {
      throw new Error(`Failed to update test auth user: ${error.message}`);
    }

    logger.info("Updated existing test auth user", { userId: existingId });
    return existingId;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: DEV_TEST_USER.email,
    password: DEV_TEST_USER.password,
    email_confirm: true,
    user_metadata: {
      display_name: DEV_TEST_USER.displayName,
    },
  });

  if (error || !data.user) {
    throw new Error(`Failed to create test auth user: ${error?.message ?? "Unknown error"}`);
  }

  logger.info("Created test auth user", { userId: data.user.id });
  return data.user.id;
}

async function ensureProfile(userId: string): Promise<void> {
  const db = getDb();
  const existing = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);

  if (existing.length > 0) {
    await db
      .update(profiles)
      .set({
        email: DEV_TEST_USER.email,
        displayName: DEV_TEST_USER.displayName,
        isActive: true,
      })
      .where(eq(profiles.id, userId));

    logger.info("Updated test profile", { profileId: userId });
    return;
  }

  await db.insert(profiles).values({
    id: userId,
    email: DEV_TEST_USER.email,
    displayName: DEV_TEST_USER.displayName,
    locale: "uk",
    timezone: "Europe/Kyiv",
    isActive: true,
  });

  logger.info("Created test profile", { profileId: userId });
}

async function main(): Promise<void> {
  logger.info("Creating development test user", {
    email: DEV_TEST_USER.email,
    loginAlias: DEV_TEST_USER.loginAlias,
    stableProfileId: DEV_TEST_USER_ID,
  });

  const authUserId = await ensureAuthUser();

  if (authUserId !== DEV_TEST_USER_ID) {
    logger.warn("Test auth user id differs from stable seed id; using Supabase auth id for profile", {
      authUserId,
      stableProfileId: DEV_TEST_USER_ID,
    });
  }

  await ensureProfile(authUserId);

  logger.info("Test user is ready", {
    login: DEV_TEST_USER.loginAlias,
    email: DEV_TEST_USER.email,
    password: DEV_TEST_USER.password,
    signInUrl: "/admin/login",
  });
}

main().catch((error: unknown) => {
  logger.error("Failed to create test user", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
