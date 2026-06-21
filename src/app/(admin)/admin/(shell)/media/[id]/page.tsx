import Image from "next/image";
import { notFound } from "next/navigation";

import { getMediaAction } from "@/actions/media";
import { PageHeader } from "@/components/navigation/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaMetadataForm } from "@/features/media/components/MediaMetadataForm";
import { MediaOperationsPanel } from "@/features/media/components/MediaOperationsPanel";
import { formatFileSize } from "@/lib/media/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<{ title: string }> {
  const { id } = await params;
  const media = await getMediaAction(id);

  return {
    title: media?.originalFilename ?? "Media asset",
  };
}

interface MediaDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function MediaDetailPage({
  params,
}: MediaDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const media = await getMediaAction(id);

  if (!media) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title={media.originalFilename}
        description={`${formatFileSize(media.fileSize)} · ${media.mimeType}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Media", href: "/admin/media" },
          { label: media.originalFilename },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {media.isOptimized ? (
              <Badge variant="success">Optimized</Badge>
            ) : null}
            {media.hasWebp ? <Badge variant="secondary">WebP</Badge> : null}
            {media.usageCount > 0 ? (
              <Badge variant="secondary">{media.usageCount} active use{media.usageCount === 1 ? "" : "s"}</Badge>
            ) : (
              <Badge variant="outline">Unused</Badge>
            )}
          </div>
        }
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
              <Image
                src={media.publicUrl}
                alt={media.altUk ?? media.altEn ?? media.originalFilename}
                fill
                className="object-contain"
                sizes="(max-width: 1280px) 100vw, 60vw"
                unoptimized
              />
            </div>
            <dl className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <div>
                <dt className="font-medium text-foreground">Dimensions</dt>
                <dd>{media.width && media.height ? `${media.width}×${media.height}` : "—"}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Storage path</dt>
                <dd className="truncate font-mono text-xs">{media.storagePath}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <MediaOperationsPanel
            mediaId={media.id}
            mimeType={media.mimeType}
            isOptimized={media.isOptimized}
            hasWebp={media.hasWebp}
          />
          <MediaMetadataForm
          mediaId={media.id}
          canDelete={media.usageCount === 0}
          defaultValues={{
            altUk: media.altUk,
            altEn: media.altEn,
            titleUk: media.titleUk,
            titleEn: media.titleEn,
            captionUk: media.captionUk,
            captionEn: media.captionEn,
            copyright: media.copyright,
            photographer: media.photographer,
            license: media.license,
            isPublic: media.isPublic,
          }}
        />
        </div>
      </div>
    </div>
  );
}
