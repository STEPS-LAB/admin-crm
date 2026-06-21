import type { EntityMediaCollection, EntityMediaItem } from "@/types/entity-media";

function mediaItemToHistorySnapshot(item: EntityMediaItem): Record<string, unknown> {
  return {
    usageId: item.usageId,
    mediaAssetId: item.mediaAssetId,
    usageType: item.usageType,
    sortOrder: item.sortOrder,
    originalFilename: item.originalFilename,
  };
}

export function mediaCollectionToHistorySnapshot(
  collection: EntityMediaCollection,
): Record<string, unknown> {
  return {
    cover: collection.cover ? mediaItemToHistorySnapshot(collection.cover) : null,
    gallery: collection.gallery.map(mediaItemToHistorySnapshot),
  };
}

export function buildMediaAttachSummary(
  usageType: EntityMediaItem["usageType"],
  originalFilename: string,
): string {
  if (usageType === "cover") {
    return `Set "${originalFilename}" as cover image`;
  }

  return `Added "${originalFilename}" to gallery`;
}

export function buildMediaDetachSummary(
  usageType: EntityMediaItem["usageType"],
  originalFilename: string,
): string {
  if (usageType === "cover") {
    return `Removed cover image "${originalFilename}"`;
  }

  return `Removed "${originalFilename}" from gallery`;
}

export const MEDIA_GALLERY_REORDER_SUMMARY = "Reordered gallery images";
