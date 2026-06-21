"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { listMediaAction } from "@/actions/media";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

import type { MediaListItem } from "@/types/media";

export interface MediaPickerDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSelect: (item: MediaListItem) => void;
  readonly title?: string;
  readonly excludeIds?: readonly string[];
}

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  title = "Choose from library",
  excludeIds = [],
}: MediaPickerDialogProps): React.JSX.Element {
  const [items, setItems] = useState<MediaListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const excluded = new Set(excludeIds);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    const load = async (): Promise<void> => {
      setIsLoading(true);

      try {
        const result = await listMediaAction({
          page: "1",
          pageSize: "48",
          q: search || undefined,
        });

        if (!cancelled) {
          setItems(result.items);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    const timeout = setTimeout(() => {
      void load();
    }, search ? 300 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [open, search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Select an image from the media library</DialogDescription>
        </DialogHeader>

        <Input
          placeholder="Search media…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search media library"
        />

        <div className="max-h-[50vh] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {items.map((item) => {
                const isExcluded = excluded.has(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={isExcluded}
                    onClick={() => {
                      onSelect(item);
                      onOpenChange(false);
                    }}
                    className={cn(
                      "overflow-hidden rounded-lg border text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isExcluded && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <div className="relative aspect-square bg-muted">
                      <Image
                        src={item.publicUrl}
                        alt={item.altUk ?? item.altEn ?? item.originalFilename}
                        fill
                        className="object-cover"
                        sizes="120px"
                        unoptimized
                      />
                    </div>
                    <p className="truncate p-2 text-xs">{item.originalFilename}</p>
                  </button>
                );
              })}
            </div>
          )}

          {!isLoading && items.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No media found</p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
