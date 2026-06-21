import {
  attachEntityMedia,
  detachEntityMedia,
  getEntityMedia,
  reorderEntityGallery,
  setEntityCover,
} from "@/services/entityMediaService";

import type { EntityMediaCollection } from "@/types/entity-media";
import type { EntityMediaUsageType } from "@/schemas/media/entityMediaSchemas";
import type { EntityMediaMutationResult } from "@/services/entityMediaService";
import type { HistoryMutationContext } from "@/services/historyService";

export type CategoryMediaMutationResult = EntityMediaMutationResult;

export async function getCategoryMedia(categoryId: string): Promise<EntityMediaCollection> {
  return getEntityMedia("category", categoryId);
}

export async function attachCategoryMedia(
  categoryId: string,
  mediaAssetId: string,
  usageType: EntityMediaUsageType,
  context: HistoryMutationContext,
): Promise<CategoryMediaMutationResult> {
  return attachEntityMedia("category", categoryId, mediaAssetId, usageType, context);
}

export async function detachCategoryMedia(
  categoryId: string,
  usageId: string,
  context: HistoryMutationContext,
): Promise<void> {
  return detachEntityMedia("category", categoryId, usageId, context);
}

export async function setCategoryCover(
  categoryId: string,
  mediaAssetId: string,
  context: HistoryMutationContext,
): Promise<CategoryMediaMutationResult> {
  return setEntityCover("category", categoryId, mediaAssetId, context);
}

export async function reorderCategoryGallery(
  categoryId: string,
  usageIds: string[],
  context: HistoryMutationContext,
): Promise<void> {
  return reorderEntityGallery("category", categoryId, usageIds, context);
}
