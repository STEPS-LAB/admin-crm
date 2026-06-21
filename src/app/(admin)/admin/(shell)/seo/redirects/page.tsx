import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";

import { listRedirectsAction } from "@/actions/seo";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/navigation/PageHeader";
import { TablePagination } from "@/components/tables/TablePagination";
import { Button } from "@/components/ui/button";
import { RedirectListFilters } from "@/features/seo/components/RedirectListFilters";
import { RedirectListTable } from "@/features/seo/components/RedirectListTable";

export const metadata = {
  title: "Redirects",
};

interface RedirectsPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RedirectsPage({
  searchParams,
}: RedirectsPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const pagination = await listRedirectsAction(params);

  const queryParams: Record<string, string | undefined> = {
    q: typeof params.q === "string" ? params.q : undefined,
    enabled: typeof params.enabled === "string" ? params.enabled : undefined,
    pageSize: typeof params.pageSize === "string" ? params.pageSize : undefined,
  };

  return (
    <>
      <PageHeader
        title="Redirects"
        description={`${pagination.total} redirect rule${pagination.total === 1 ? "" : "s"}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "SEO Center", href: "/admin/seo" },
          { label: "Redirects" },
        ]}
        actions={
          <Button asChild>
            <Link href="/admin/seo/redirects/new">
              <Plus className="mr-2 h-4 w-4" />
              New redirect
            </Link>
          </Button>
        }
      />

      <div className="mt-8 space-y-6">
        <Suspense fallback={<div className="h-10 animate-pulse rounded-md bg-muted" />}>
          <RedirectListFilters />
        </Suspense>

        {pagination.items.length === 0 ? (
          <EmptyState
            title="No redirects yet"
            description="Create redirect rules to preserve SEO equity when URLs change."
          />
        ) : (
          <>
            <RedirectListTable items={pagination.items} />
            <TablePagination
              pagination={pagination}
              basePath="/admin/seo/redirects"
              searchParams={queryParams}
            />
          </>
        )}

        {pagination.items.length === 0 ? (
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/admin/seo/redirects/new">Create first redirect</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </>
  );
}
