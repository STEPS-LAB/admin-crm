"use client";

import {
  attachPageMediaAction,
  detachPageMediaAction,
  reorderPageGalleryAction,
  setPageCoverAction,
} from "@/actions/pages";
import { EntityMediaPanel } from "@/features/media/components/EntityMediaPanel";

import type { EntityMediaCollection } from "@/types/entity-media";

export interface PageMediaPanelProps {
  readonly pageId: string;
  readonly media: EntityMediaCollection;
}

export function PageMediaPanel({ pageId, media }: PageMediaPanelProps): React.JSX.Element {
  return (
    <EntityMediaPanel
      media={media}
      coverDescription="Featured image for page previews and social sharing"
      galleryDescription="Additional page visuals in display order"
      actions={{
        attach: (mediaAssetId, usageType) => attachPageMediaAction(pageId, mediaAssetId, usageType),
        detach: (usageId) => detachPageMediaAction(pageId, usageId),
        setCover: (mediaAssetId) => setPageCoverAction(pageId, mediaAssetId),
        reorderGallery: async (usageIds) => {
          const result = await reorderPageGalleryAction(pageId, usageIds);
          return result.success ? { success: true, data: { id: pageId } } : result;
        },
      }}
    />
  );
}
