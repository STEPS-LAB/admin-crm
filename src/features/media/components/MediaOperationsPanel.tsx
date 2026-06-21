"use client";

import { ImageDown, Loader2, Replace } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { toast } from "sonner";

import { compressMediaAction } from "@/actions/media/compressMedia";
import { replaceMediaAction } from "@/actions/media/replaceMedia";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export interface MediaOperationsPanelProps {
  readonly mediaId: string;
  readonly mimeType: string;
  readonly isOptimized: boolean;
  readonly hasWebp: boolean;
}

export function MediaOperationsPanel({
  mediaId,
  mimeType,
  isOptimized,
  hasWebp,
}: MediaOperationsPanelProps): React.JSX.Element {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, startCompress] = useTransition();
  const [isReplacing, startReplace] = useTransition();

  const isImage = mimeType.startsWith("image/");

  const runCompress = (): void => {
    startCompress(async () => {
      const result = await compressMediaAction(mediaId);

      if (result.success) {
        toast.success("Image compressed");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const runReplace = (file: File): void => {
    const formData = new FormData();
    formData.set("file", file);

    startReplace(async () => {
      const result = await replaceMediaAction(mediaId, formData);

      if (result.success) {
        toast.success("File replaced");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">File operations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {isOptimized ? <Badge variant="success">Optimized</Badge> : <Badge variant="outline">Not optimized</Badge>}
          {hasWebp ? <Badge variant="secondary">WebP</Badge> : null}
        </div>

        {isImage ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={isCompressing || isReplacing}
              onClick={runCompress}
            >
              {isCompressing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ImageDown className="mr-2 h-4 w-4" />
              )}
              Compress image
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isCompressing || isReplacing}
              onClick={() => fileInputRef.current?.click()}
            >
              {isReplacing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Replace className="mr-2 h-4 w-4" />
              )}
              Replace file
            </Button>

            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              aria-hidden
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  runReplace(file);
                }

                event.target.value = "";
              }}
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Compression and replace are available for image assets only.
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          Replacing a file keeps the same asset ID and storage path so existing references stay valid.
        </p>
      </CardContent>
    </Card>
  );
}
