import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { robotsConfig } from "@/db/schema/seo";

import type { RobotsConfigDetail, RobotsConfigInput } from "@/types/sitemap-robots";

function mapRobotsConfigRow(row: typeof robotsConfig.$inferSelect): RobotsConfigDetail {
  return {
    id: row.id,
    userAgent: row.userAgent,
    allowRules: row.allowRules,
    disallowRules: row.disallowRules,
    host: row.host,
    sitemapUrls: Array.isArray(row.sitemapUrls) ? (row.sitemapUrls as string[]) : [],
    customDirectives: row.customDirectives,
    isActive: row.isActive,
    updatedAt: row.updatedAt,
  };
}

export async function findActiveRobotsConfig(): Promise<RobotsConfigDetail | null> {
  const db = getDb();

  const [row] = await db
    .select()
    .from(robotsConfig)
    .where(eq(robotsConfig.isActive, true))
    .limit(1);

  return row ? mapRobotsConfigRow(row) : null;
}

export async function findRobotsConfigById(id: string): Promise<RobotsConfigDetail | null> {
  const db = getDb();

  const [row] = await db.select().from(robotsConfig).where(eq(robotsConfig.id, id)).limit(1);

  return row ? mapRobotsConfigRow(row) : null;
}

export async function upsertDefaultRobotsConfig(
  input: RobotsConfigInput,
): Promise<RobotsConfigDetail> {
  const db = getDb();
  const existing = await findActiveRobotsConfig();

  if (existing) {
    const [updated] = await db
      .update(robotsConfig)
      .set({
        userAgent: input.userAgent,
        allowRules: input.allowRules,
        disallowRules: input.disallowRules,
        host: input.host,
        sitemapUrls: input.sitemapUrls,
        customDirectives: input.customDirectives,
        isActive: input.isActive,
        updatedAt: new Date(),
      })
      .where(eq(robotsConfig.id, existing.id))
      .returning();

    if (!updated) {
      throw new Error("Failed to update robots configuration");
    }

    return mapRobotsConfigRow(updated);
  }

  const [created] = await db
    .insert(robotsConfig)
    .values({
      userAgent: input.userAgent,
      allowRules: input.allowRules,
      disallowRules: input.disallowRules,
      host: input.host,
      sitemapUrls: input.sitemapUrls,
      customDirectives: input.customDirectives,
      isActive: input.isActive,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create robots configuration");
  }

  return mapRobotsConfigRow(created);
}
