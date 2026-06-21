import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";

import { listPagesAction } from "@/actions/pages";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/navigation/PageHeader";
import { TablePagination } from "@/components/tables/TablePagination";
import { Button } from "@/components/ui/button";
import { PageListFilters } from "@/features/pages/components/PageListFilters";
import { PageListTable } from "@/features/pages/components/PageListTable";

export const metadata = {
  title: "Pages",
};

interface PagesPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PagesPage({
  searchParams,
}: PagesPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const pagination = await listPagesAction(params);

  const queryParams: Record<string, string | undefined> = {
    q: typeof params.q === "string" ? params.q : undefined,
    status: typeof params.status === "string" ? params.status : undefined,
    pageType: typeof params.pageType === "string" ? params.pageType : undefined,
    pageSize: typeof params.pageSize === "string" ? params.pageSize : undefined,
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Pages"
        description={`${pagination.total} page${pagination.total === 1 ? "" : "s"}`}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Pages" }]}
        actions={
          <Button asChild>
            <Link href="/admin/pages/new">
              <Plus className="mr-2 h-4 w-4" />
              New page
            </Link>
          </Button>
        }
      />

      <div className="mt-8 space-y-6">
        <Suspense fallback={<div className="h-10 animate-pulse rounded-md bg-muted" />}>
          <PageListFilters />
        </Suspense>

        {pagination.items.length === 0 ? (
          <EmptyState
            title="No pages yet"
            description="Create your first page for legal content, landing pages, and more."
          />
        ) : (
          <>
            <PageListTable items={pagination.items} />
            <TablePagination
              pagination={pagination}
              basePath="/admin/pages"
              searchParams={queryParams}
            />
          </>
        )}

        {pagination.items.length === 0 ? (
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/admin/pages/new">Create first page</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
