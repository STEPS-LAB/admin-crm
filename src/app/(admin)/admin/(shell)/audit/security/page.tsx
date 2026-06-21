import { Suspense } from "react";

import { listSecurityAuditAction } from "@/actions/audit";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/navigation/PageHeader";
import { TablePagination } from "@/components/tables/TablePagination";
import { SecurityAuditFilters } from "@/features/audit/components/SecurityAuditFilters";
import { SecurityAuditTable } from "@/features/audit/components/SecurityAuditTable";
import { AuditExportPanel } from "@/features/import-export/components/AuditExportPanel";

export const metadata = {
  title: "Security Audit",
};

interface SecurityAuditPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SecurityAuditPage({
  searchParams,
}: SecurityAuditPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const pagination = await listSecurityAuditAction(params);

  const queryParams: Record<string, string | undefined> = {
    q: typeof params.q === "string" ? params.q : undefined,
    action: typeof params.action === "string" ? params.action : undefined,
    pageSize: typeof params.pageSize === "string" ? params.pageSize : undefined,
  };

  return (
    <>
      <PageHeader
        title="Security events"
        description={`${pagination.total} security event${pagination.total === 1 ? "" : "s"}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Audit Log", href: "/admin/audit" },
          { label: "Security" },
        ]}
        actions={<AuditExportPanel source="security" />}
      />

      <div className="mt-8 space-y-6">
        <Suspense fallback={<div className="h-10 animate-pulse rounded-md bg-muted" />}>
          <SecurityAuditFilters />
        </Suspense>

        {pagination.items.length === 0 ? (
          <EmptyState
            title="No security events yet"
            description="Login, logout, and authentication events will be recorded here."
          />
        ) : (
          <>
            <SecurityAuditTable items={pagination.items} />
            <TablePagination
              pagination={pagination}
              basePath="/admin/audit/security"
              searchParams={queryParams}
            />
          </>
        )}
      </div>
    </>
  );
}
