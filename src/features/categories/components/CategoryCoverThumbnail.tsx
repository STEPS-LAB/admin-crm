import { EntityCoverThumbnail } from "@/features/catalog/components/EntityCoverThumbnail";

import type { EntityCoverThumbnailProps } from "@/features/catalog/components/EntityCoverThumbnail";

export type CategoryCoverThumbnailProps = Omit<EntityCoverThumbnailProps, "fallback">;

export function CategoryCoverThumbnail(props: CategoryCoverThumbnailProps): React.JSX.Element {
  return <EntityCoverThumbnail {...props} fallback="category" />;
}
