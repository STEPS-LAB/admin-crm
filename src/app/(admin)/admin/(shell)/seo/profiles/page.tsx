import { Suspense } from "react";

import { listSeoProfilesAction } from "@/actions/seo";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/navigation/PageHeader";
import { TablePagination } from "@/components/tables/TablePagination";
import { SeoProfileListFilters } from "@/features/seo/components/SeoProfileListFilters";
import { SeoProfileListTable } from "@/features/seo/components/SeoProfileListTable";

export const metadata = {
  title: "SEO Profiles",
};

interface SeoProfilesPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SeoProfilesPage({
  searchParams,
}: SeoProfilesPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const pagination = await listSeoProfilesAction(params);

  const queryParams: Record<string, string | undefined> = {
    q: typeof params.q === "string" ? params.q : undefined,
    ownerType: typeof params.ownerType === "string" ? params.ownerType : undefined,
    language: typeof params.language === "string" ? params.language : undefined,
    pageSize: typeof params.pageSize === "string" ? params.pageSize : undefined,
  };

  return (
    <>
      <PageHeader
        title="SEO profiles"
        description={`${pagination.total} profile${pagination.total === 1 ? "" : "s"} across catalog entities`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "SEO Center", href: "/admin/seo" },
          { label: "Profiles" },
        ]}
      />

      <div className="mt-8 space-y-6">
        <Suspense fallback={<div className="h-10 animate-pulse rounded-md bg-muted" />}>
          <SeoProfileListFilters />
        </Suspense>

        {pagination.items.length === 0 ? (
          <EmptyState
            title="No SEO profiles found"
            description="Profiles are created when entities are analyzed. Adjust filters or create catalog content first."
          />
        ) : (
          <>
            <SeoProfileListTable items={pagination.items} />
            <TablePagination
              pagination={pagination}
              basePath="/admin/seo/profiles"
              searchParams={queryParams}
            />
          </>
        )}
      </div>
    </>
  );
}
