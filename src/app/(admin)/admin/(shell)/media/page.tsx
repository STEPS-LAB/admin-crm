import { Suspense } from "react";

import { listMediaAction } from "@/actions/media";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/navigation/PageHeader";
import { TablePagination } from "@/components/tables/TablePagination";
import { MediaGrid } from "@/features/media/components/MediaGrid";
import { MediaListFilters } from "@/features/media/components/MediaListFilters";
import { MediaUploadZone } from "@/features/media/components/MediaUploadZone";

export const metadata = {
  title: "Media Library",
};

interface MediaLibraryPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MediaLibraryPage({
  searchParams,
}: MediaLibraryPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const pagination = await listMediaAction(params);

  const queryParams: Record<string, string | undefined> = {
    q: typeof params.q === "string" ? params.q : undefined,
    mimeType: typeof params.mimeType === "string" ? params.mimeType : undefined,
    filter: typeof params.filter === "string" ? params.filter : undefined,
    pageSize: typeof params.pageSize === "string" ? params.pageSize : undefined,
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Media Library"
        description={`${pagination.total} asset${pagination.total === 1 ? "" : "s"} in library`}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Media" }]}
      />

      <div className="mt-8 space-y-6">
        <MediaUploadZone />

        <Suspense fallback={<div className="h-10 animate-pulse rounded-md bg-muted" />}>
          <MediaListFilters />
        </Suspense>

        {pagination.items.length === 0 ? (
          <EmptyState
            title="No media yet"
            description="Upload images to build a reusable asset library for products, categories, and SEO."
          />
        ) : (
          <>
            <MediaGrid items={pagination.items} />
            <TablePagination
              pagination={pagination}
              basePath="/admin/media"
              searchParams={queryParams}
            />
          </>
        )}
      </div>
    </div>
  );
}
