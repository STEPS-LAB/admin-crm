"use client";

import {
  attachCategoryMediaAction,
  detachCategoryMediaAction,
  reorderCategoryGalleryAction,
  setCategoryCoverAction,
} from "@/actions/categories";
import { EntityMediaPanel } from "@/features/media/components/EntityMediaPanel";

import type { EntityMediaCollection } from "@/types/entity-media";

export interface CategoryMediaPanelProps {
  readonly categoryId: string;
  readonly media: EntityMediaCollection;
}

export function CategoryMediaPanel({ categoryId, media }: CategoryMediaPanelProps): React.JSX.Element {
  return (
    <EntityMediaPanel
      media={media}
      coverDescription="Primary category image for navigation and SEO"
      galleryDescription="Additional category visuals in display order"
      actions={{
        attach: (mediaAssetId, usageType) => attachCategoryMediaAction(categoryId, mediaAssetId, usageType),
        detach: (usageId) => detachCategoryMediaAction(categoryId, usageId),
        setCover: (mediaAssetId) => setCategoryCoverAction(categoryId, mediaAssetId),
        reorderGallery: async (usageIds) => {
          const result = await reorderCategoryGalleryAction(categoryId, usageIds);
          return result.success ? { success: true, data: { id: categoryId } } : result;
        },
      }}
    />
  );
}
