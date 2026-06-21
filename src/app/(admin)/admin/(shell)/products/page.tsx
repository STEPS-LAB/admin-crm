import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";

import { getProductFormOptionsAction, listProductsAction } from "@/actions/products";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/navigation/PageHeader";
import { TablePagination } from "@/components/tables/TablePagination";
import { Button } from "@/components/ui/button";
import { ProductListFilters } from "@/features/products/components/ProductListFilters";
import { ProductListTable } from "@/features/products/components/ProductListTable";

export const metadata = {
  title: "Products",
};

interface ProductsPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const [pagination, formOptions] = await Promise.all([
    listProductsAction(params),
    getProductFormOptionsAction(),
  ]);

  const queryParams: Record<string, string | undefined> = {
    q: typeof params.q === "string" ? params.q : undefined,
    status: typeof params.status === "string" ? params.status : undefined,
    categoryId: typeof params.categoryId === "string" ? params.categoryId : undefined,
    brandId: typeof params.brandId === "string" ? params.brandId : undefined,
    stockStatus: typeof params.stockStatus === "string" ? params.stockStatus : undefined,
    filter: typeof params.filter === "string" ? params.filter : undefined,
    pageSize: typeof params.pageSize === "string" ? params.pageSize : undefined,
    sortBy: typeof params.sortBy === "string" ? params.sortBy : undefined,
    sortDir: typeof params.sortDir === "string" ? params.sortDir : undefined,
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Products"
        description={`${pagination.total} product${pagination.total === 1 ? "" : "s"} in catalog`}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Products" }]}
        actions={
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              New product
            </Link>
          </Button>
        }
      />

      <div className="mt-8 space-y-6">
        <Suspense fallback={<div className="h-10 animate-pulse rounded-md bg-muted" />}>
          <ProductListFilters categories={formOptions.categories} brands={formOptions.brands} />
        </Suspense>

        {pagination.items.length === 0 ? (
          <EmptyState
            title="No products yet"
            description="Create your first product to start building the catalog."
          />
        ) : (
          <>
            <ProductListTable items={pagination.items} />
            <TablePagination
              pagination={pagination}
              basePath="/admin/products"
              searchParams={queryParams}
            />
          </>
        )}

        {pagination.items.length === 0 ? (
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/admin/products/new">Create first product</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
