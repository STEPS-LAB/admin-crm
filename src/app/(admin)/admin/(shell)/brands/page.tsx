import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";

import { listBrandsAction } from "@/actions/brands";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/navigation/PageHeader";
import { TablePagination } from "@/components/tables/TablePagination";
import { Button } from "@/components/ui/button";
import { BrandListFilters } from "@/features/brands/components/BrandListFilters";
import { BrandListTable } from "@/features/brands/components/BrandListTable";

export const metadata = {
  title: "Brands",
};

interface BrandsPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BrandsPage({
  searchParams,
}: BrandsPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const pagination = await listBrandsAction(params);

  const queryParams: Record<string, string | undefined> = {
    q: typeof params.q === "string" ? params.q : undefined,
    status: typeof params.status === "string" ? params.status : undefined,
    hasProducts: typeof params.hasProducts === "string" ? params.hasProducts : undefined,
    pageSize: typeof params.pageSize === "string" ? params.pageSize : undefined,
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Brands"
        description={`${pagination.total} brand${pagination.total === 1 ? "" : "s"}`}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Brands" }]}
        actions={
          <Button asChild>
            <Link href="/admin/brands/new">
              <Plus className="mr-2 h-4 w-4" />
              New brand
            </Link>
          </Button>
        }
      />

      <div className="mt-8 space-y-6">
        <Suspense fallback={<div className="h-10 animate-pulse rounded-md bg-muted" />}>
          <BrandListFilters />
        </Suspense>

        {pagination.items.length === 0 ? (
          <EmptyState
            title="No brands yet"
            description="Create your first brand to organize products by manufacturer or vendor."
          />
        ) : (
          <>
            <BrandListTable items={pagination.items} />
            <TablePagination
              pagination={pagination}
              basePath="/admin/brands"
              searchParams={queryParams}
            />
          </>
        )}

        {pagination.items.length === 0 ? (
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/admin/brands/new">Create first brand</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
