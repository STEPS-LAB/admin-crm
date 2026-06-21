"use client";

import {
  attachProductMediaAction,
  detachProductMediaAction,
  reorderProductGalleryAction,
  setProductCoverAction,
} from "@/actions/products";
import { EntityMediaPanel } from "@/features/media/components/EntityMediaPanel";

import type { EntityMediaCollection } from "@/types/entity-media";

export interface ProductMediaPanelProps {
  readonly productId: string;
  readonly media: EntityMediaCollection;
}

export function ProductMediaPanel({ productId, media }: ProductMediaPanelProps): React.JSX.Element {
  return (
    <EntityMediaPanel
      media={media}
      coverDescription="Primary product image used in listings and SEO"
      galleryDescription="Additional product images in display order"
      actions={{
        attach: (mediaAssetId, usageType) => attachProductMediaAction(productId, mediaAssetId, usageType),
        detach: (usageId) => detachProductMediaAction(productId, usageId),
        setCover: (mediaAssetId) => setProductCoverAction(productId, mediaAssetId),
        reorderGallery: async (usageIds) => {
          const result = await reorderProductGalleryAction(productId, usageIds);
          return result.success ? { success: true, data: { id: productId } } : result;
        },
      }}
    />
  );
}
