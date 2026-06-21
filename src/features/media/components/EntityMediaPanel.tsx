"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaPickerDialog } from "@/features/media/components/MediaPickerDialog";

import type { MediaListItem } from "@/types/media";
import type { EntityMediaCollection } from "@/types/entity-media";
import type { EntityMediaUsageType } from "@/schemas/media/entityMediaSchemas";
import type { ServerActionResult } from "@/types";

export interface EntityMediaPanelActions {
  readonly attach: (
    mediaAssetId: string,
    usageType: EntityMediaUsageType,
  ) => Promise<ServerActionResult<{ usageId: string }>>;
  readonly detach: (usageId: string) => Promise<ServerActionResult<{ usageId: string }>>;
  readonly setCover: (mediaAssetId: string) => Promise<ServerActionResult<{ usageId: string }>>;
  readonly reorderGallery: (usageIds: string[]) => Promise<ServerActionResult<{ id: string }>>;
}

export interface EntityMediaPanelProps {
  readonly media: EntityMediaCollection;
  readonly actions: EntityMediaPanelActions;
  readonly coverDescription: string;
  readonly galleryDescription: string;
}

export function EntityMediaPanel({
  media,
  actions,
  coverDescription,
  galleryDescription,
}: EntityMediaPanelProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pickerMode, setPickerMode] = useState<"cover" | "gallery" | null>(null);

  const attachedAssetIds = [
    ...(media.cover ? [media.cover.mediaAssetId] : []),
    ...media.gallery.map((item) => item.mediaAssetId),
  ];

  const refresh = (): void => {
    router.refresh();
  };

  const runAttach = (item: MediaListItem, usageType: EntityMediaUsageType): void => {
    startTransition(async () => {
      const result = await actions.attach(item.id, usageType);

      if (result.success) {
        toast.success(usageType === "cover" ? "Cover image set" : "Image added to gallery");
        refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const runDetach = (usageId: string): void => {
    startTransition(async () => {
      const result = await actions.detach(usageId);

      if (result.success) {
        toast.success("Image removed");
        refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const runSetCover = (mediaAssetId: string): void => {
    startTransition(async () => {
      const result = await actions.setCover(mediaAssetId);

      if (result.success) {
        toast.success("Cover image updated");
        refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const moveGalleryItem = (index: number, direction: -1 | 1): void => {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= media.gallery.length) {
      return;
    }

    const usageIds = media.gallery.map((item) => item.usageId);
    const [moved] = usageIds.splice(index, 1);

    if (!moved) {
      return;
    }

    usageIds.splice(nextIndex, 0, moved);

    startTransition(async () => {
      const result = await actions.reorderGallery(usageIds);

      if (result.success) {
        refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Cover image</CardTitle>
            <CardDescription>{coverDescription}</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => setPickerMode("cover")}>
            <ImagePlus className="mr-2 h-4 w-4" />
            {media.cover ? "Replace" : "Add cover"}
          </Button>
        </CardHeader>
        <CardContent>
          {media.cover ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={media.cover.publicUrl}
                  alt={media.cover.altUk ?? media.cover.altEn ?? media.cover.originalFilename}
                  fill
                  className="object-cover"
                  sizes="320px"
                  unoptimized
                />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium">{media.cover.originalFilename}</p>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  onClick={() => runDetach(media.cover!.usageId)}
                >
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Remove cover
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No cover image yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Gallery</CardTitle>
            <CardDescription>{galleryDescription}</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => setPickerMode("gallery")}>
            <ImagePlus className="mr-2 h-4 w-4" />
            Add image
          </Button>
        </CardHeader>
        <CardContent>
          {media.gallery.length === 0 ? (
            <p className="text-sm text-muted-foreground">No gallery images yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {media.gallery.map((item, index) => (
                <div key={item.usageId} className="overflow-hidden rounded-lg border">
                  <div className="relative aspect-square bg-muted">
                    <Image
                      src={item.publicUrl}
                      alt={item.altUk ?? item.altEn ?? item.originalFilename}
                      fill
                      className="object-cover"
                      sizes="240px"
                      unoptimized
                    />
                  </div>
                  <div className="space-y-2 p-3">
                    <p className="truncate text-sm font-medium">{item.originalFilename}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => runSetCover(item.mediaAssetId)}
                      >
                        <Star className="mr-1 h-3.5 w-3.5" />
                        Set cover
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={isPending || index === 0}
                        onClick={() => moveGalleryItem(index, -1)}
                        aria-label="Move earlier"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={isPending || index === media.gallery.length - 1}
                        onClick={() => moveGalleryItem(index, 1)}
                        aria-label="Move later"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        disabled={isPending}
                        onClick={() => runDetach(item.usageId)}
                        aria-label="Remove from gallery"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Need a new file?{" "}
        <Link href="/admin/media" className="text-primary hover:underline">
          Upload in Media Library
        </Link>
      </p>

      <MediaPickerDialog
        open={pickerMode !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPickerMode(null);
          }
        }}
        title={pickerMode === "cover" ? "Choose cover image" : "Add gallery image"}
        excludeIds={pickerMode === "gallery" ? attachedAssetIds : []}
        onSelect={(item) => {
          if (pickerMode) {
            runAttach(item, pickerMode);
            setPickerMode(null);
          }
        }}
      />
    </div>
  );
}
