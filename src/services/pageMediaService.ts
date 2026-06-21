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

export type PageMediaMutationResult = EntityMediaMutationResult;

export async function getPageMedia(pageId: string): Promise<EntityMediaCollection> {
  return getEntityMedia("page", pageId);
}

export async function attachPageMedia(
  pageId: string,
  mediaAssetId: string,
  usageType: EntityMediaUsageType,
  context: HistoryMutationContext,
): Promise<PageMediaMutationResult> {
  return attachEntityMedia("page", pageId, mediaAssetId, usageType, context);
}

export async function detachPageMedia(
  pageId: string,
  usageId: string,
  context: HistoryMutationContext,
): Promise<void> {
  return detachEntityMedia("page", pageId, usageId, context);
}

export async function setPageCover(
  pageId: string,
  mediaAssetId: string,
  context: HistoryMutationContext,
): Promise<PageMediaMutationResult> {
  return setEntityCover("page", pageId, mediaAssetId, context);
}

export async function reorderPageGallery(
  pageId: string,
  usageIds: string[],
  context: HistoryMutationContext,
): Promise<void> {
  return reorderEntityGallery("page", pageId, usageIds, context);
}
