import { and, asc, count, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db/client";
import { mediaAssets, mediaUsage } from "@/db/schema/storage";
import { buildMediaPublicUrl } from "@/lib/media/publicUrl";

import type { EntityMediaItem, MediaOwnerType } from "@/types/entity-media";
import type { EntityMediaUsageType } from "@/schemas/media/entityMediaSchemas";

function mapUsageRow(
  usage: typeof mediaUsage.$inferSelect,
  asset: typeof mediaAssets.$inferSelect,
): EntityMediaItem {
  return {
    usageId: usage.id,
    mediaAssetId: asset.id,
    usageType: usage.usageType as EntityMediaUsageType,
    sortOrder: usage.sortOrder,
    originalFilename: asset.originalFilename,
    mimeType: asset.mimeType,
    fileSize: asset.fileSize,
    altUk: asset.altUk,
    altEn: asset.altEn,
    publicUrl: buildMediaPublicUrl(asset.storageBucket, asset.storagePath),
    width: asset.width,
    height: asset.height,
  };
}

export async function findOwnerMediaItems(
  ownerType: MediaOwnerType,
  ownerId: string,
): Promise<EntityMediaItem[]> {
  const db = getDb();

  const rows = await db
    .select({
      usage: mediaUsage,
      asset: mediaAssets,
    })
    .from(mediaUsage)
    .innerJoin(mediaAssets, eq(mediaUsage.mediaAssetId, mediaAssets.id))
    .where(
      and(
        eq(mediaUsage.ownerType, ownerType),
        eq(mediaUsage.ownerId, ownerId),
        eq(mediaAssets.isDeleted, false),
        inArray(mediaUsage.usageType, ["cover", "gallery"]),
      ),
    )
    .orderBy(asc(mediaUsage.sortOrder), asc(mediaUsage.createdAt));

  return rows.map((row) => mapUsageRow(row.usage, row.asset));
}

export async function ownerHasCover(ownerType: MediaOwnerType, ownerId: string): Promise<boolean> {
  const db = getDb();

  const result = await db
    .select({ value: count() })
    .from(mediaUsage)
    .where(
      and(
        eq(mediaUsage.ownerType, ownerType),
        eq(mediaUsage.ownerId, ownerId),
        eq(mediaUsage.usageType, "cover"),
      ),
    );

  return (result[0]?.value ?? 0) > 0;
}

export async function findMediaUsageById(
  usageId: string,
): Promise<(typeof mediaUsage.$inferSelect) | null> {
  const db = getDb();

  const rows = await db.select().from(mediaUsage).where(eq(mediaUsage.id, usageId)).limit(1);

  return rows[0] ?? null;
}

export async function findOwnerMediaUsage(
  ownerType: MediaOwnerType,
  ownerId: string,
  mediaAssetId: string,
): Promise<(typeof mediaUsage.$inferSelect) | null> {
  const db = getDb();

  const rows = await db
    .select()
    .from(mediaUsage)
    .where(
      and(
        eq(mediaUsage.ownerType, ownerType),
        eq(mediaUsage.ownerId, ownerId),
        eq(mediaUsage.mediaAssetId, mediaAssetId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function getNextGallerySortOrder(
  ownerType: MediaOwnerType,
  ownerId: string,
): Promise<number> {
  const db = getDb();

  const rows = await db
    .select({ sortOrder: mediaUsage.sortOrder })
    .from(mediaUsage)
    .where(
      and(
        eq(mediaUsage.ownerType, ownerType),
        eq(mediaUsage.ownerId, ownerId),
        eq(mediaUsage.usageType, "gallery"),
      ),
    )
    .orderBy(asc(mediaUsage.sortOrder));

  const last = rows.at(-1);

  return last ? last.sortOrder + 1 : 0;
}

export async function insertMediaUsage(input: {
  readonly mediaAssetId: string;
  readonly ownerType: MediaOwnerType;
  readonly ownerId: string;
  readonly usageType: EntityMediaUsageType;
  readonly sortOrder: number;
}): Promise<string> {
  const db = getDb();

  const rows = await db
    .insert(mediaUsage)
    .values({
      mediaAssetId: input.mediaAssetId,
      ownerType: input.ownerType,
      ownerId: input.ownerId,
      usageType: input.usageType,
      sortOrder: input.sortOrder,
    })
    .returning({ id: mediaUsage.id });

  const id = rows[0]?.id;

  if (!id) {
    throw new Error("Failed to attach media");
  }

  return id;
}

export async function deleteMediaUsage(usageId: string): Promise<boolean> {
  const db = getDb();

  const rows = await db.delete(mediaUsage).where(eq(mediaUsage.id, usageId)).returning({ id: mediaUsage.id });

  return rows.length > 0;
}

export async function deleteOwnerCoverUsages(
  ownerType: MediaOwnerType,
  ownerId: string,
): Promise<void> {
  const db = getDb();

  await db
    .delete(mediaUsage)
    .where(
      and(
        eq(mediaUsage.ownerType, ownerType),
        eq(mediaUsage.ownerId, ownerId),
        eq(mediaUsage.usageType, "cover"),
      ),
    );
}

export async function updateMediaUsageType(
  usageId: string,
  usageType: EntityMediaUsageType,
  sortOrder: number,
): Promise<void> {
  const db = getDb();

  await db
    .update(mediaUsage)
    .set({ usageType, sortOrder })
    .where(eq(mediaUsage.id, usageId));
}

export async function updateMediaUsageSortOrders(
  updates: Array<{ readonly usageId: string; readonly sortOrder: number }>,
): Promise<void> {
  const db = getDb();

  await db.transaction(async (tx) => {
    for (const update of updates) {
      await tx
        .update(mediaUsage)
        .set({ sortOrder: update.sortOrder })
        .where(eq(mediaUsage.id, update.usageId));
    }
  });
}
