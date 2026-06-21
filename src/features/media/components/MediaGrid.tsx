import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatFileSize } from "@/lib/media/format";

import type { MediaListItem } from "@/types/media";

export interface MediaGridProps {
  readonly items: MediaListItem[];
}

export function MediaGrid({ items }: MediaGridProps): React.JSX.Element {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/admin/media/${item.id}`}
          className="group overflow-hidden rounded-lg border border-border/60 bg-card transition-shadow hover:shadow-md"
        >
          <div className="relative aspect-square bg-muted">
            <Image
              src={item.publicUrl}
              alt={item.altUk ?? item.altEn ?? item.originalFilename}
              fill
              className="object-cover transition-transform group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 50vw, 25vw"
              unoptimized
            />
          </div>
          <div className="space-y-2 p-3">
            <p className="truncate text-sm font-medium">{item.originalFilename}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{formatFileSize(item.fileSize)}</span>
              <span>·</span>
              <span>{item.extension.toUpperCase()}</span>
              {item.usageCount > 0 ? (
                <Badge variant="secondary" className="ml-auto">
                  {item.usageCount} use{item.usageCount === 1 ? "" : "s"}
                </Badge>
              ) : (
                <Badge variant="outline" className="ml-auto">
                  Unused
                </Badge>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
