import { z } from "zod";

import { MEDIA_OWNER_TYPES } from "@/types/entity-media";

export const ENTITY_MEDIA_USAGE_TYPES = ["cover", "gallery"] as const;

export type EntityMediaUsageType = (typeof ENTITY_MEDIA_USAGE_TYPES)[number];

export const mediaOwnerTypeSchema = z.enum(MEDIA_OWNER_TYPES);

export const ownerIdParamSchema = z.object({
  ownerType: mediaOwnerTypeSchema,
  ownerId: z.string().uuid(),
});

export const attachEntityMediaSchema = z.object({
  ownerType: mediaOwnerTypeSchema,
  ownerId: z.string().uuid(),
  mediaAssetId: z.string().uuid(),
  usageType: z.enum(ENTITY_MEDIA_USAGE_TYPES).default("gallery"),
});

export const detachEntityMediaSchema = z.object({
  ownerType: mediaOwnerTypeSchema,
  ownerId: z.string().uuid(),
  usageId: z.string().uuid(),
});

export const setEntityCoverSchema = z.object({
  ownerType: mediaOwnerTypeSchema,
  ownerId: z.string().uuid(),
  mediaAssetId: z.string().uuid(),
});

export const reorderEntityGallerySchema = z.object({
  ownerType: mediaOwnerTypeSchema,
  ownerId: z.string().uuid(),
  usageIds: z.array(z.string().uuid()).min(1),
});

// Product-specific aliases for backward compatibility
export const PRODUCT_MEDIA_USAGE_TYPES = ENTITY_MEDIA_USAGE_TYPES;
export type MediaUsageType = EntityMediaUsageType;

export const productIdParamSchema = z.object({
  productId: z.string().uuid(),
});

export const attachProductMediaSchema = z.object({
  productId: z.string().uuid(),
  mediaAssetId: z.string().uuid(),
  usageType: z.enum(ENTITY_MEDIA_USAGE_TYPES).default("gallery"),
});

export const detachProductMediaSchema = z.object({
  productId: z.string().uuid(),
  usageId: z.string().uuid(),
});

export const setProductCoverSchema = z.object({
  productId: z.string().uuid(),
  mediaAssetId: z.string().uuid(),
});

export const reorderProductGallerySchema = z.object({
  productId: z.string().uuid(),
  usageIds: z.array(z.string().uuid()).min(1),
});

export const categoryIdParamSchema = z.object({
  categoryId: z.string().uuid(),
});

export const attachCategoryMediaSchema = z.object({
  categoryId: z.string().uuid(),
  mediaAssetId: z.string().uuid(),
  usageType: z.enum(ENTITY_MEDIA_USAGE_TYPES).default("gallery"),
});

export const detachCategoryMediaSchema = z.object({
  categoryId: z.string().uuid(),
  usageId: z.string().uuid(),
});

export const setCategoryCoverSchema = z.object({
  categoryId: z.string().uuid(),
  mediaAssetId: z.string().uuid(),
});

export const reorderCategoryGallerySchema = z.object({
  categoryId: z.string().uuid(),
  usageIds: z.array(z.string().uuid()).min(1),
});

export const pageIdParamSchema = z.object({
  pageId: z.string().uuid(),
});

export const attachPageMediaSchema = z.object({
  pageId: z.string().uuid(),
  mediaAssetId: z.string().uuid(),
  usageType: z.enum(ENTITY_MEDIA_USAGE_TYPES).default("gallery"),
});

export const detachPageMediaSchema = z.object({
  pageId: z.string().uuid(),
  usageId: z.string().uuid(),
});

export const setPageCoverSchema = z.object({
  pageId: z.string().uuid(),
  mediaAssetId: z.string().uuid(),
});

export const reorderPageGallerySchema = z.object({
  pageId: z.string().uuid(),
  usageIds: z.array(z.string().uuid()).min(1),
});

export const brandIdParamSchema = z.object({
  brandId: z.string().uuid(),
});

export const attachBrandMediaSchema = z.object({
  brandId: z.string().uuid(),
  mediaAssetId: z.string().uuid(),
  usageType: z.enum(ENTITY_MEDIA_USAGE_TYPES).default("gallery"),
});

export const detachBrandMediaSchema = z.object({
  brandId: z.string().uuid(),
  usageId: z.string().uuid(),
});

export const setBrandCoverSchema = z.object({
  brandId: z.string().uuid(),
  mediaAssetId: z.string().uuid(),
});

export const reorderBrandGallerySchema = z.object({
  brandId: z.string().uuid(),
  usageIds: z.array(z.string().uuid()).min(1),
});
