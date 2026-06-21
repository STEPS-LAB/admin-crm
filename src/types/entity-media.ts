import type { EntityMediaUsageType } from "@/schemas/media/entityMediaSchemas";

export interface EntityMediaItem {
  readonly usageId: string;
  readonly mediaAssetId: string;
  readonly usageType: EntityMediaUsageType;
  readonly sortOrder: number;
  readonly originalFilename: string;
  readonly mimeType: string;
  readonly fileSize: number;
  readonly altUk: string | null;
  readonly altEn: string | null;
  readonly publicUrl: string;
  readonly width: number | null;
  readonly height: number | null;
}

export interface EntityMediaCollection {
  readonly cover: EntityMediaItem | null;
  readonly gallery: EntityMediaItem[];
}

export type ProductMediaItem = EntityMediaItem;
export type ProductMediaCollection = EntityMediaCollection;

export const MEDIA_OWNER_TYPES = ["product", "category", "page", "brand"] as const;

export type MediaOwnerType = (typeof MEDIA_OWNER_TYPES)[number];
