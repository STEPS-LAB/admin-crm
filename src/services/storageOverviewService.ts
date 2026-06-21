import { count, eq, sql } from "drizzle-orm";

import { DEFAULT_MEDIA_BUCKET } from "@/constants/media";
import { getDb } from "@/db/client";
import { mediaAssets } from "@/db/schema/storage";
import { findSettings } from "@/repositories/settingsRepository";

export interface StorageOverview {
  readonly provider: string;
  readonly defaultBucket: string;
  readonly maxUploadSizeMb: number;
  readonly totalAssets: number;
  readonly totalBytes: number;
  readonly optimizedAssets: number;
}

export async function getStorageOverview(): Promise<StorageOverview> {
  const settings = await findSettings();
  const db = getDb();

  const [stats] = await db
    .select({
      totalAssets: count(),
      totalBytes: sql<number>`coalesce(sum(${mediaAssets.fileSize}), 0)::bigint`,
      optimizedAssets: sql<number>`coalesce(sum(case when ${mediaAssets.isOptimized} then 1 else 0 end), 0)::int`,
    })
    .from(mediaAssets)
    .where(eq(mediaAssets.isDeleted, false));

  return {
    provider: settings?.storageProvider ?? "supabase",
    defaultBucket: DEFAULT_MEDIA_BUCKET,
    maxUploadSizeMb: settings?.maxUploadSizeMb ?? 25,
    totalAssets: stats?.totalAssets ?? 0,
    totalBytes: Number(stats?.totalBytes ?? 0),
    optimizedAssets: stats?.optimizedAssets ?? 0,
  };
}
