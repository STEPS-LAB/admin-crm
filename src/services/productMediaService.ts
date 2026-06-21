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

export type ProductMediaMutationResult = EntityMediaMutationResult;

export async function getProductMedia(productId: string): Promise<EntityMediaCollection> {
  return getEntityMedia("product", productId);
}

export async function attachProductMedia(
  productId: string,
  mediaAssetId: string,
  usageType: EntityMediaUsageType,
  context: HistoryMutationContext,
): Promise<ProductMediaMutationResult> {
  return attachEntityMedia("product", productId, mediaAssetId, usageType, context);
}

export async function detachProductMedia(
  productId: string,
  usageId: string,
  context: HistoryMutationContext,
): Promise<void> {
  return detachEntityMedia("product", productId, usageId, context);
}

export async function setProductCover(
  productId: string,
  mediaAssetId: string,
  context: HistoryMutationContext,
): Promise<ProductMediaMutationResult> {
  return setEntityCover("product", productId, mediaAssetId, context);
}

export async function reorderProductGallery(
  productId: string,
  usageIds: string[],
  context: HistoryMutationContext,
): Promise<void> {
  return reorderEntityGallery("product", productId, usageIds, context);
}
