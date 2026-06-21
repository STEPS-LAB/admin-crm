import { count, eq, isNull } from "drizzle-orm";

import { getDb } from "@/db/client";
import { featureFlagInstallations } from "@/db/schema/feature-flags";
import { categories, products } from "@/db/schema/catalog";
import { pages } from "@/db/schema/pages";
import {
  redirectRules,
  robotsConfig,
  seoProfiles,
  seoTemplates,
  sitemapConfig,
} from "@/db/schema/seo";
import { settings } from "@/db/schema/settings";
import { mediaAssets } from "@/db/schema/storage";
import { softDeleteFilter } from "@/repositories/baseRepository";

import type { BackupType } from "@/constants/backup";
import type { BackupSnapshotPayload } from "@/types/backup";

function serializeRow<T extends Record<string, unknown>>(row: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(row)) {
    if (value instanceof Date) {
      result[key] = value.toISOString();
      continue;
    }

    result[key] = value;
  }

  return result;
}

export async function collectMetadataCounts(): Promise<Record<string, number>> {
  const db = getDb();

  const [productCount, categoryCount, pageCount, mediaCount, seoProfileCount] = await Promise.all([
    db
      .select({ value: count() })
      .from(products)
      .where(softDeleteFilter(products.deletedAt)),
    db
      .select({ value: count() })
      .from(categories)
      .where(softDeleteFilter(categories.deletedAt)),
    db
      .select({ value: count() })
      .from(pages)
      .where(softDeleteFilter(pages.deletedAt)),
    db
      .select({ value: count() })
      .from(mediaAssets)
      .where(eq(mediaAssets.isDeleted, false)),
    db
      .select({ value: count() })
      .from(seoProfiles)
      .where(isNull(seoProfiles.deletedAt)),
  ]);

  return {
    products: Number(productCount[0]?.value ?? 0),
    categories: Number(categoryCount[0]?.value ?? 0),
    pages: Number(pageCount[0]?.value ?? 0),
    mediaAssets: Number(mediaCount[0]?.value ?? 0),
    seoProfiles: Number(seoProfileCount[0]?.value ?? 0),
  };
}

export async function collectFullBackupSnapshot(): Promise<
  Omit<BackupSnapshotPayload, "manifest">
> {
  const db = getDb();

  const [
    settingsRows,
    redirectRows,
    templateRows,
    flagRows,
    sitemapRows,
    robotsRows,
    counts,
  ] = await Promise.all([
    db.select().from(settings).limit(1),
    db.select().from(redirectRules),
    db.select().from(seoTemplates),
    db.select().from(featureFlagInstallations),
    db.select().from(sitemapConfig),
    db.select().from(robotsConfig),
    collectMetadataCounts(),
  ]);

  const settingsRow = settingsRows[0];

  return {
    settings: settingsRow ? serializeRow(settingsRow) : null,
    redirectRules: redirectRows.map(serializeRow),
    seoTemplates: templateRows.map(serializeRow),
    featureFlagInstallations: flagRows.map(serializeRow),
    sitemapConfig: sitemapRows.map(serializeRow),
    robotsConfig: robotsRows.map(serializeRow),
    counts,
  };
}

export async function collectBackupSnapshot(
  backupType: BackupType,
): Promise<Omit<BackupSnapshotPayload, "manifest">> {
  if (backupType === "metadata") {
    const counts = await collectMetadataCounts();
    const db = getDb();
    const settingsRows = await db.select().from(settings).limit(1);
    const settingsRow = settingsRows[0];

    return {
      settings: settingsRow
        ? {
            siteName: settingsRow.siteName,
            siteUrl: settingsRow.siteUrl,
            defaultLanguage: settingsRow.defaultLanguage,
          }
        : null,
      redirectRules: [],
      seoTemplates: [],
      featureFlagInstallations: [],
      sitemapConfig: [],
      robotsConfig: [],
      counts,
    };
  }

  return collectFullBackupSnapshot();
}
