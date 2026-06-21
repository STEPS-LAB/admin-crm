"use client";

import { ImageIcon, Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { uploadMediaAction } from "@/actions/media/uploadMedia";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

import type { ServerActionResult } from "@/types";
import type { MediaMutationResult } from "@/services/mediaService";

const initialState: ServerActionResult<MediaMutationResult> | null = null;

export function MediaUploadZone(): React.JSX.Element {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [state, formAction, isPending] = useActionState(uploadMediaAction, initialState);

  useEffect(() => {
    if (state?.success) {
      if (state.data.duplicate) {
        toast.info("This file already exists in the library");
      } else {
        toast.success("File uploaded");
      }

      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, router]);

  const uploadFiles = useCallback(
    (files: FileList | File[]) => {
      const fileList = Array.from(files);

      if (fileList.length === 0) {
        return;
      }

      for (const file of fileList) {
        const formData = new FormData();
        formData.set("file", file);
        formAction(formData);
      }
    },
    [formAction],
  );

  const onDrop = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(false);
    uploadFiles(event.dataTransfer.files);
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-dashed p-6 transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-border/60 bg-muted/20",
      )}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        multiple
        className="sr-only"
        onChange={(event) => {
          if (event.target.files) {
            uploadFiles(event.target.files);
            event.target.value = "";
          }
        }}
      />

      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium">Drop images here or browse</p>
          <p className="mt-1 text-xs text-muted-foreground">PNG, JPEG, WebP, GIF, AVIF · max 25 MB</p>
        </div>
        <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => inputRef.current?.click()}>
          <ImageIcon className="mr-2 h-4 w-4" />
          Choose files
        </Button>
      </div>
    </div>
  );
}
