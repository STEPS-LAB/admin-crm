import { Suspense } from "react";

import { listHistoryAuditAction } from "@/actions/audit";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/navigation/PageHeader";
import { TablePagination } from "@/components/tables/TablePagination";
import { AuditExportPanel } from "@/features/import-export/components/AuditExportPanel";
import { HistoryAuditFilters } from "@/features/audit/components/HistoryAuditFilters";
import { HistoryAuditTable } from "@/features/audit/components/HistoryAuditTable";

export const metadata = {
  title: "Audit Log",
};

interface ChangeHistoryPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ChangeHistoryPage({
  searchParams,
}: ChangeHistoryPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const pagination = await listHistoryAuditAction(params);

  const queryParams: Record<string, string | undefined> = {
    q: typeof params.q === "string" ? params.q : undefined,
    entityType: typeof params.entityType === "string" ? params.entityType : undefined,
    operation: typeof params.operation === "string" ? params.operation : undefined,
    pageSize: typeof params.pageSize === "string" ? params.pageSize : undefined,
  };

  return (
    <>
      <PageHeader
        title="Audit Log"
        description={`${pagination.total} change record${pagination.total === 1 ? "" : "s"}`}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Audit Log" }]}
        actions={<AuditExportPanel source="history" />}
      />

      <div className="mt-8 space-y-6">
        <Suspense fallback={<div className="h-10 animate-pulse rounded-md bg-muted" />}>
          <HistoryAuditFilters />
        </Suspense>

        {pagination.items.length === 0 ? (
          <EmptyState
            title="No change history yet"
            description="Entity updates and settings changes will appear here as immutable audit records."
          />
        ) : (
          <>
            <HistoryAuditTable items={pagination.items} />
            <TablePagination
              pagination={pagination}
              basePath="/admin/audit"
              searchParams={queryParams}
            />
          </>
        )}
      </div>
    </>
  );
}
