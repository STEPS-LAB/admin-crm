import { findBrandById } from "@/repositories/brandRepository";
import { findCategoryById } from "@/repositories/categoryRepository";
import { findMediaAssetById } from "@/repositories/mediaRepository";
import {
  deleteMediaUsage,
  deleteOwnerCoverUsages,
  findMediaUsageById,
  findOwnerMediaItems,
  findOwnerMediaUsage,
  getNextGallerySortOrder,
  insertMediaUsage,
  updateMediaUsageSortOrders,
  updateMediaUsageType,
} from "@/repositories/mediaUsageRepository";
import { findProductById } from "@/repositories/productRepository";
import { findPageById } from "@/repositories/pageRepository";
import {
  buildMediaAttachSummary,
  buildMediaDetachSummary,
  MEDIA_GALLERY_REORDER_SUMMARY,
  mediaCollectionToHistorySnapshot,
} from "@/lib/history/mediaSnapshots";
import { recordEntityUpdate, type HistoryMutationContext } from "@/services/historyService";

import type {
  EntityMediaCollection,
  EntityMediaItem,
  MediaOwnerType,
} from "@/types/entity-media";
import type { EntityMediaUsageType } from "@/schemas/media/entityMediaSchemas";
import type { historyEntries } from "@/db/schema/history";

export interface EntityMediaMutationResult {
  readonly usageId: string;
}

type HistoryEntityType = typeof historyEntries.$inferInsert["entityType"];

const OWNER_NOT_FOUND: Record<MediaOwnerType, string> = {
  product: "Product not found",
  category: "Category not found",
  page: "Page not found",
  brand: "Brand not found",
};

const OWNER_HISTORY_ENTITY_TYPE: Record<MediaOwnerType, HistoryEntityType> = {
  product: "product",
  category: "category",
  page: "page",
  brand: "brand",
};

function groupEntityMedia(items: EntityMediaItem[]): EntityMediaCollection {
  const cover = items.find((item) => item.usageType === "cover") ?? null;
  const gallery = items
    .filter((item) => item.usageType === "gallery")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return { cover, gallery };
}

async function recordMediaCollectionChange(
  ownerType: MediaOwnerType,
  ownerId: string,
  changeSummary: string,
  before: EntityMediaCollection,
  after: EntityMediaCollection,
  context: HistoryMutationContext,
): Promise<void> {
  await recordEntityUpdate(
    OWNER_HISTORY_ENTITY_TYPE[ownerType],
    ownerId,
    changeSummary,
    mediaCollectionToHistorySnapshot(before),
    mediaCollectionToHistorySnapshot(after),
    context,
  );
}

function findMediaItemByUsageId(
  collection: EntityMediaCollection,
  usageId: string,
): EntityMediaItem | null {
  if (collection.cover?.usageId === usageId) {
    return collection.cover;
  }

  return collection.gallery.find((item) => item.usageId === usageId) ?? null;
}

async function requireOwner(ownerType: MediaOwnerType, ownerId: string): Promise<void> {
  if (ownerType === "product") {
    const product = await findProductById(ownerId);

    if (!product) {
      throw new Error(OWNER_NOT_FOUND.product);
    }

    return;
  }

  if (ownerType === "category") {
    const category = await findCategoryById(ownerId);

    if (!category) {
      throw new Error(OWNER_NOT_FOUND.category);
    }

    return;
  }

  if (ownerType === "page") {
    const page = await findPageById(ownerId);

    if (!page) {
      throw new Error(OWNER_NOT_FOUND.page);
    }

    return;
  }

  const brand = await findBrandById(ownerId);

  if (!brand) {
    throw new Error(OWNER_NOT_FOUND.brand);
  }
}

export async function getEntityMedia(
  ownerType: MediaOwnerType,
  ownerId: string,
): Promise<EntityMediaCollection> {
  await requireOwner(ownerType, ownerId);
  const items = await findOwnerMediaItems(ownerType, ownerId);

  return groupEntityMedia(items);
}

export async function attachEntityMedia(
  ownerType: MediaOwnerType,
  ownerId: string,
  mediaAssetId: string,
  usageType: EntityMediaUsageType,
  context: HistoryMutationContext,
): Promise<EntityMediaMutationResult> {
  await requireOwner(ownerType, ownerId);
  const asset = await findMediaAssetById(mediaAssetId);

  if (!asset) {
    throw new Error("Media asset not found");
  }

  const before = await getEntityMedia(ownerType, ownerId);
  const existing = await findOwnerMediaUsage(ownerType, ownerId, mediaAssetId);

  if (existing) {
    if (usageType === "cover") {
      await deleteOwnerCoverUsages(ownerType, ownerId);
      await updateMediaUsageType(existing.id, "cover", 0);

      const after = await getEntityMedia(ownerType, ownerId);

      await recordMediaCollectionChange(
        ownerType,
        ownerId,
        buildMediaAttachSummary("cover", asset.originalFilename),
        before,
        after,
        context,
      );

      return { usageId: existing.id };
    }

    throw new Error("Media is already attached to this entity");
  }

  if (usageType === "cover") {
    await deleteOwnerCoverUsages(ownerType, ownerId);
  }

  const sortOrder =
    usageType === "cover" ? 0 : await getNextGallerySortOrder(ownerType, ownerId);

  const usageId = await insertMediaUsage({
    mediaAssetId,
    ownerType,
    ownerId,
    usageType,
    sortOrder,
  });

  const after = await getEntityMedia(ownerType, ownerId);

  await recordMediaCollectionChange(
    ownerType,
    ownerId,
    buildMediaAttachSummary(usageType, asset.originalFilename),
    before,
    after,
    context,
  );

  return { usageId };
}

export async function detachEntityMedia(
  ownerType: MediaOwnerType,
  ownerId: string,
  usageId: string,
  context: HistoryMutationContext,
): Promise<void> {
  await requireOwner(ownerType, ownerId);

  const before = await getEntityMedia(ownerType, ownerId);
  const detachedItem = findMediaItemByUsageId(before, usageId);

  if (!detachedItem) {
    throw new Error("Media usage not found");
  }

  const usage = await findMediaUsageById(usageId);

  if (!usage || usage.ownerType !== ownerType || usage.ownerId !== ownerId) {
    throw new Error("Media usage not found");
  }

  const deleted = await deleteMediaUsage(usageId);

  if (!deleted) {
    throw new Error("Failed to detach media");
  }

  const after = await getEntityMedia(ownerType, ownerId);

  await recordMediaCollectionChange(
    ownerType,
    ownerId,
    buildMediaDetachSummary(detachedItem.usageType, detachedItem.originalFilename),
    before,
    after,
    context,
  );
}

export async function setEntityCover(
  ownerType: MediaOwnerType,
  ownerId: string,
  mediaAssetId: string,
  context: HistoryMutationContext,
): Promise<EntityMediaMutationResult> {
  return attachEntityMedia(ownerType, ownerId, mediaAssetId, "cover", context);
}

export async function reorderEntityGallery(
  ownerType: MediaOwnerType,
  ownerId: string,
  usageIds: string[],
  context: HistoryMutationContext,
): Promise<void> {
  await requireOwner(ownerType, ownerId);

  const before = await getEntityMedia(ownerType, ownerId);
  const galleryIds = new Set(
    before.gallery.map((item) => item.usageId),
  );

  if (usageIds.length !== galleryIds.size || usageIds.some((id) => !galleryIds.has(id))) {
    throw new Error("Invalid gallery order");
  }

  await updateMediaUsageSortOrders(
    usageIds.map((usageId, index) => ({ usageId, sortOrder: index })),
  );

  const after = await getEntityMedia(ownerType, ownerId);

  await recordMediaCollectionChange(
    ownerType,
    ownerId,
    MEDIA_GALLERY_REORDER_SUMMARY,
    before,
    after,
    context,
  );
}
