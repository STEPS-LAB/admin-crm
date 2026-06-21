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

export type BrandMediaMutationResult = EntityMediaMutationResult;

export async function getBrandMedia(brandId: string): Promise<EntityMediaCollection> {
  return getEntityMedia("brand", brandId);
}

export async function attachBrandMedia(
  brandId: string,
  mediaAssetId: string,
  usageType: EntityMediaUsageType,
  context: HistoryMutationContext,
): Promise<BrandMediaMutationResult> {
  return attachEntityMedia("brand", brandId, mediaAssetId, usageType, context);
}

export async function detachBrandMedia(
  brandId: string,
  usageId: string,
  context: HistoryMutationContext,
): Promise<void> {
  return detachEntityMedia("brand", brandId, usageId, context);
}

export async function setBrandCover(
  brandId: string,
  mediaAssetId: string,
  context: HistoryMutationContext,
): Promise<BrandMediaMutationResult> {
  return setEntityCover("brand", brandId, mediaAssetId, context);
}

export async function reorderBrandGallery(
  brandId: string,
  usageIds: string[],
  context: HistoryMutationContext,
): Promise<void> {
  return reorderEntityGallery("brand", brandId, usageIds, context);
}
