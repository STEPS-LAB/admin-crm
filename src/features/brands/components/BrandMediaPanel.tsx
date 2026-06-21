"use client";

import {
  attachBrandMediaAction,
  detachBrandMediaAction,
  reorderBrandGalleryAction,
  setBrandCoverAction,
} from "@/actions/brands";
import { EntityMediaPanel } from "@/features/media/components/EntityMediaPanel";

import type { EntityMediaCollection } from "@/types/entity-media";

export interface BrandMediaPanelProps {
  readonly brandId: string;
  readonly media: EntityMediaCollection;
}

export function BrandMediaPanel({ brandId, media }: BrandMediaPanelProps): React.JSX.Element {
  return (
    <EntityMediaPanel
      media={media}
      coverDescription="Brand logo used in listings and product pages"
      galleryDescription="Banners and additional brand visuals"
      actions={{
        attach: (mediaAssetId, usageType) => attachBrandMediaAction(brandId, mediaAssetId, usageType),
        detach: (usageId) => detachBrandMediaAction(brandId, usageId),
        setCover: (mediaAssetId) => setBrandCoverAction(brandId, mediaAssetId),
        reorderGallery: async (usageIds) => {
          const result = await reorderBrandGalleryAction(brandId, usageIds);
          return result.success ? { success: true, data: { id: brandId } } : result;
        },
      }}
    />
  );
}
