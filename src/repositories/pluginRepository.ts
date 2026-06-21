import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { pluginInstallations } from "@/db/schema/plugins";

export interface PluginInstallationRecord {
  readonly id: string;
  readonly slug: string;
  readonly enabled: boolean;
  readonly installedAt: Date;
  readonly updatedAt: Date;
}

export async function findPluginInstallations(): Promise<PluginInstallationRecord[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: pluginInstallations.id,
      slug: pluginInstallations.slug,
      enabled: pluginInstallations.enabled,
      installedAt: pluginInstallations.installedAt,
      updatedAt: pluginInstallations.updatedAt,
    })
    .from(pluginInstallations);

  return rows;
}

export async function upsertPluginInstallation(input: {
  slug: string;
  enabled: boolean;
}): Promise<PluginInstallationRecord> {
  const db = getDb();
  const now = new Date();

  const [row] = await db
    .insert(pluginInstallations)
    .values({
      slug: input.slug,
      enabled: input.enabled,
      installedAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: pluginInstallations.slug,
      set: {
        enabled: input.enabled,
        updatedAt: now,
      },
    })
    .returning({
      id: pluginInstallations.id,
      slug: pluginInstallations.slug,
      enabled: pluginInstallations.enabled,
      installedAt: pluginInstallations.installedAt,
      updatedAt: pluginInstallations.updatedAt,
    });

  if (!row) {
    throw new Error("Failed to update plugin installation");
  }

  return row;
}

export async function findPluginInstallationBySlug(
  slug: string,
): Promise<PluginInstallationRecord | null> {
  const db = getDb();

  const [row] = await db
    .select({
      id: pluginInstallations.id,
      slug: pluginInstallations.slug,
      enabled: pluginInstallations.enabled,
      installedAt: pluginInstallations.installedAt,
      updatedAt: pluginInstallations.updatedAt,
    })
    .from(pluginInstallations)
    .where(eq(pluginInstallations.slug, slug))
    .limit(1);

  return row ?? null;
}
