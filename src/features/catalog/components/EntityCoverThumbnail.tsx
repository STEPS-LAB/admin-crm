import Image from "next/image";
import { FolderTree, Package } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export type EntityCoverThumbnailFallback = "category" | "product";

const FALLBACK_ICONS = {
  category: FolderTree,
  product: Package,
} as const;

export interface EntityCoverThumbnailProps {
  readonly name: string;
  readonly coverThumbnailUrl: string | null;
  readonly coverAlt: string | null;
  readonly fallback: EntityCoverThumbnailFallback;
  readonly className?: string;
}

export function EntityCoverThumbnail({
  name,
  coverThumbnailUrl,
  coverAlt,
  fallback,
  className,
}: EntityCoverThumbnailProps): React.JSX.Element {
  const FallbackIcon = FALLBACK_ICONS[fallback];

  if (!coverThumbnailUrl) {
    return (
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <FallbackIcon className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative h-9 w-9 shrink-0 overflow-hidden rounded-md border bg-muted",
        className,
      )}
    >
      <Image
        src={coverThumbnailUrl}
        alt={coverAlt ?? name}
        fill
        sizes="36px"
        className="object-cover"
      />
    </div>
  );
}
