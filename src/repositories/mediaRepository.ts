import { and, count, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";

import { getDb } from "@/db/client";
import { mediaAssets, mediaUsage } from "@/db/schema/storage";
import { calculatePagination } from "@/repositories/baseRepository";
import { buildMediaPublicUrl } from "@/lib/media/publicUrl";

import type { Pagination } from "@/types";
import type {
  MediaDetail,
  MediaListFilters,
  MediaListItem,
  MediaMetadataInput,
} from "@/types/media";

type MediaAssetRow = typeof mediaAssets.$inferSelect;

export interface InsertMediaAssetInput {
  readonly storageBucket: string;
  readonly storagePath: string;
  readonly originalFilename: string;
  readonly generatedFilename: string;
  readonly extension: string;
  readonly mimeType: string;
  readonly fileSize: number;
  readonly sha256Hash: string;
  readonly width?: number | null;
  readonly height?: number | null;
  readonly isOptimized?: boolean;
  readonly hasWebp?: boolean;
}

function mapListItem(row: MediaAssetRow, usageCount: number): MediaListItem {
  return {
    id: row.id,
    originalFilename: row.originalFilename,
    mimeType: row.mimeType,
    extension: row.extension,
    fileSize: row.fileSize,
    width: row.width,
    height: row.height,
    altUk: row.altUk,
    altEn: row.altEn,
    usageCount,
    publicUrl: buildMediaPublicUrl(row.storageBucket, row.storagePath),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapDetail(row: MediaAssetRow, usageCount: number): MediaDetail {
  return {
    id: row.id,
    storageBucket: row.storageBucket,
    storagePath: row.storagePath,
    originalFilename: row.originalFilename,
    generatedFilename: row.generatedFilename,
    extension: row.extension,
    mimeType: row.mimeType,
    fileSize: row.fileSize,
    width: row.width,
    height: row.height,
    altUk: row.altUk,
    altEn: row.altEn,
    titleUk: row.titleUk,
    titleEn: row.titleEn,
    captionUk: row.captionUk,
    captionEn: row.captionEn,
    copyright: row.copyright,
    photographer: row.photographer,
    license: row.license,
    isPublic: row.isPublic,
    isOptimized: row.isOptimized,
    hasWebp: row.hasWebp,
    usageCount,
    publicUrl: buildMediaPublicUrl(row.storageBucket, row.storagePath),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function getUsageCounts(assetIds: string[]): Promise<Map<string, number>> {
  if (assetIds.length === 0) {
    return new Map();
  }

  const db = getDb();
  const rows = await db
    .select({
      mediaAssetId: mediaUsage.mediaAssetId,
      value: count(),
    })
    .from(mediaUsage)
    .where(inArray(mediaUsage.mediaAssetId, assetIds))
    .groupBy(mediaUsage.mediaAssetId);

  const usageMap = new Map<string, number>();

  for (const row of rows) {
    usageMap.set(row.mediaAssetId, row.value);
  }

  return usageMap;
}

function buildListWhere(filters: MediaListFilters): SQL | undefined {
  const conditions: SQL[] = [eq(mediaAssets.isDeleted, false)];

  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(mediaAssets.originalFilename, term),
        ilike(mediaAssets.altUk, term),
        ilike(mediaAssets.altEn, term),
      )!,
    );
  }

  if (filters.mimeType) {
    conditions.push(eq(mediaAssets.mimeType, filters.mimeType));
  }

  if (filters.filter === "unused") {
    conditions.push(
      sql`not exists (select 1 from ${mediaUsage} where ${mediaUsage.mediaAssetId} = ${mediaAssets.id})`,
    );
  }

  return and(...conditions);
}

export async function findMediaAssets(
  filters: MediaListFilters,
): Promise<Pagination<MediaListItem>> {
  const db = getDb();
  const whereClause = buildListWhere(filters);
  const offset = (filters.page - 1) * filters.pageSize;

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(mediaAssets)
      .where(whereClause)
      .orderBy(desc(mediaAssets.createdAt))
      .limit(filters.pageSize)
      .offset(offset),
    db.select({ value: count() }).from(mediaAssets).where(whereClause),
  ]);

  const usageMap = await getUsageCounts(rows.map((row) => row.id));

  return calculatePagination(
    rows.map((row) => mapListItem(row, usageMap.get(row.id) ?? 0)),
    totalRows[0]?.value ?? 0,
    { page: filters.page, pageSize: filters.pageSize },
  );
}

export async function findMediaAssetById(id: string): Promise<MediaDetail | null> {
  const db = getDb();

  const rows = await db
    .select()
    .from(mediaAssets)
    .where(and(eq(mediaAssets.id, id), eq(mediaAssets.isDeleted, false)))
    .limit(1);

  const row = rows[0];

  if (!row) {
    return null;
  }

  const usageMap = await getUsageCounts([row.id]);

  return mapDetail(row, usageMap.get(row.id) ?? 0);
}

export async function findMediaAssetByHash(hash: string): Promise<MediaDetail | null> {
  const db = getDb();

  const rows = await db
    .select()
    .from(mediaAssets)
    .where(and(eq(mediaAssets.sha256Hash, hash), eq(mediaAssets.isDeleted, false)))
    .limit(1);

  const row = rows[0];

  if (!row) {
    return null;
  }

  const usageMap = await getUsageCounts([row.id]);

  return mapDetail(row, usageMap.get(row.id) ?? 0);
}

export async function insertMediaAsset(input: InsertMediaAssetInput): Promise<string> {
  const db = getDb();

  const rows = await db
    .insert(mediaAssets)
    .values({
      storageBucket: input.storageBucket,
      storagePath: input.storagePath,
      originalFilename: input.originalFilename,
      generatedFilename: input.generatedFilename,
      extension: input.extension,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
      sha256Hash: input.sha256Hash,
      width: input.width ?? null,
      height: input.height ?? null,
      isOptimized: input.isOptimized ?? false,
      hasWebp: input.hasWebp ?? false,
    })
    .returning({ id: mediaAssets.id });

  const id = rows[0]?.id;

  if (!id) {
    throw new Error("Failed to create media asset record");
  }

  return id;
}

export async function updateMediaAssetMetadata(
  id: string,
  input: MediaMetadataInput,
): Promise<MediaDetail | null> {
  const db = getDb();

  const rows = await db
    .update(mediaAssets)
    .set({
      altUk: input.altUk,
      altEn: input.altEn,
      titleUk: input.titleUk,
      titleEn: input.titleEn,
      captionUk: input.captionUk,
      captionEn: input.captionEn,
      copyright: input.copyright,
      photographer: input.photographer,
      license: input.license,
      isPublic: input.isPublic,
      updatedAt: new Date(),
    })
    .where(and(eq(mediaAssets.id, id), eq(mediaAssets.isDeleted, false)))
    .returning();

  const row = rows[0];

  if (!row) {
    return null;
  }

  const usageMap = await getUsageCounts([row.id]);

  return mapDetail(row, usageMap.get(row.id) ?? 0);
}

export async function countMediaUsage(assetId: string): Promise<number> {
  const db = getDb();

  const rows = await db
    .select({ value: count() })
    .from(mediaUsage)
    .where(eq(mediaUsage.mediaAssetId, assetId));

  return rows[0]?.value ?? 0;
}

export async function softDeleteMediaAsset(id: string): Promise<boolean> {
  const db = getDb();

  const rows = await db
    .update(mediaAssets)
    .set({
      isDeleted: true,
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(mediaAssets.id, id), eq(mediaAssets.isDeleted, false)))
    .returning({ id: mediaAssets.id });

  return rows.length > 0;
}

export async function findMediaAssetRowById(id: string): Promise<MediaAssetRow | null> {
  const db = getDb();

  const rows = await db
    .select()
    .from(mediaAssets)
    .where(and(eq(mediaAssets.id, id), eq(mediaAssets.isDeleted, false)))
    .limit(1);

  return rows[0] ?? null;
}

export interface UpdateMediaBinaryInput {
  readonly mimeType: string;
  readonly extension: string;
  readonly fileSize: number;
  readonly sha256Hash: string;
  readonly width: number | null;
  readonly height: number | null;
  readonly isOptimized: boolean;
  readonly hasWebp: boolean;
  readonly originalFilename?: string;
}

export async function updateMediaAssetBinary(
  id: string,
  input: UpdateMediaBinaryInput,
): Promise<MediaDetail | null> {
  const db = getDb();

  const rows = await db
    .update(mediaAssets)
    .set({
      mimeType: input.mimeType,
      extension: input.extension,
      fileSize: input.fileSize,
      sha256Hash: input.sha256Hash,
      width: input.width,
      height: input.height,
      isOptimized: input.isOptimized,
      hasWebp: input.hasWebp,
      ...(input.originalFilename ? { originalFilename: input.originalFilename } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(mediaAssets.id, id), eq(mediaAssets.isDeleted, false)))
    .returning();

  const row = rows[0];

  if (!row) {
    return null;
  }

  const usageMap = await getUsageCounts([row.id]);

  return mapDetail(row, usageMap.get(row.id) ?? 0);
}
