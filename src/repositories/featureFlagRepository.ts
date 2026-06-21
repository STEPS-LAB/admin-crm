import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { featureFlagInstallations } from "@/db/schema/feature-flags";

export interface FeatureFlagInstallationRecord {
  readonly id: string;
  readonly slug: string;
  readonly enabled: boolean;
  readonly installedAt: Date;
  readonly updatedAt: Date;
}

export async function findFeatureFlagInstallations(): Promise<FeatureFlagInstallationRecord[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: featureFlagInstallations.id,
      slug: featureFlagInstallations.slug,
      enabled: featureFlagInstallations.enabled,
      installedAt: featureFlagInstallations.installedAt,
      updatedAt: featureFlagInstallations.updatedAt,
    })
    .from(featureFlagInstallations);

  return rows;
}

export async function upsertFeatureFlagInstallation(input: {
  slug: string;
  enabled: boolean;
}): Promise<FeatureFlagInstallationRecord> {
  const db = getDb();
  const now = new Date();

  const [row] = await db
    .insert(featureFlagInstallations)
    .values({
      slug: input.slug,
      enabled: input.enabled,
      installedAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: featureFlagInstallations.slug,
      set: {
        enabled: input.enabled,
        updatedAt: now,
      },
    })
    .returning({
      id: featureFlagInstallations.id,
      slug: featureFlagInstallations.slug,
      enabled: featureFlagInstallations.enabled,
      installedAt: featureFlagInstallations.installedAt,
      updatedAt: featureFlagInstallations.updatedAt,
    });

  if (!row) {
    throw new Error("Failed to update feature flag installation");
  }

  return row;
}

export async function findFeatureFlagInstallationBySlug(
  slug: string,
): Promise<FeatureFlagInstallationRecord | null> {
  const db = getDb();

  const [row] = await db
    .select({
      id: featureFlagInstallations.id,
      slug: featureFlagInstallations.slug,
      enabled: featureFlagInstallations.enabled,
      installedAt: featureFlagInstallations.installedAt,
      updatedAt: featureFlagInstallations.updatedAt,
    })
    .from(featureFlagInstallations)
    .where(eq(featureFlagInstallations.slug, slug))
    .limit(1);

  return row ?? null;
}
