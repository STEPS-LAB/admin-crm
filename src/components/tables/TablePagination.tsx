import Link from "next/link";

import { Button } from "@/components/ui/button";

import type { Pagination } from "@/types";

export interface TablePaginationProps {
  readonly pagination: Pagination<unknown>;
  readonly basePath: string;
  readonly searchParams: Record<string, string | undefined>;
}

function buildHref(
  basePath: string,
  searchParams: Record<string, string | undefined>,
  page: number,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value) {
      params.set(key, value);
    }
  }

  params.set("page", String(page));

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function TablePagination({
  pagination,
  basePath,
  searchParams,
}: TablePaginationProps): React.JSX.Element {
  const { page, totalPages, hasPreviousPage, hasNextPage, total, pageSize } = pagination;

  if (total === 0) {
    return <></>;
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={!hasPreviousPage} asChild={hasPreviousPage}>
          {hasPreviousPage ? (
            <Link href={buildHref(basePath, searchParams, page - 1)}>Previous</Link>
          ) : (
            <span>Previous</span>
          )}
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button variant="outline" size="sm" disabled={!hasNextPage} asChild={hasNextPage}>
          {hasNextPage ? (
            <Link href={buildHref(basePath, searchParams, page + 1)}>Next</Link>
          ) : (
            <span>Next</span>
          )}
        </Button>
      </div>
    </div>
  );
}
