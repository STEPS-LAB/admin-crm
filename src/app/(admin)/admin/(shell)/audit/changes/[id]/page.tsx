import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { notFound } from "next/navigation";

import { getHistoryAuditAction } from "@/actions/audit";
import { PageHeader } from "@/components/navigation/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HISTORY_ENTITY_LABELS, HISTORY_OPERATION_LABELS } from "@/constants/audit";
import { HistoryChangeDiff } from "@/features/audit/components/HistoryChangeDiff";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<{ title: string }> {
  const { id } = await params;
  const entry = await getHistoryAuditAction(id);

  return {
    title: entry?.changeSummary ?? "Audit entry",
  };
}

interface HistoryAuditDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function HistoryAuditDetailPage({
  params,
}: HistoryAuditDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const entry = await getHistoryAuditAction(id);

  if (!entry) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={entry.changeSummary}
        description={format(entry.createdAt, "PPpp", { locale: uk })}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Audit Log", href: "/admin/audit" },
          { label: entry.changeSummary },
        ]}
      />

      <div className="mt-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Entity</p>
              <Badge variant="outline" className="mt-1">
                {HISTORY_ENTITY_LABELS[entry.entityType] ?? entry.entityType}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Operation</p>
              <p className="mt-1 text-sm font-medium">
                {HISTORY_OPERATION_LABELS[entry.operation] ?? entry.operation}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Actor</p>
              <p className="mt-1 text-sm font-medium">
                {entry.isSystemAction ? "System" : (entry.actorName ?? "Unknown")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">IP address</p>
              <p className="mt-1 font-mono text-sm">{entry.ipAddress ?? "—"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Entity ID</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{entry.entityId}</p>
            </div>
          </CardContent>
        </Card>

        <HistoryChangeDiff
          changedFields={entry.changedFields}
          beforeData={entry.beforeData}
          afterData={entry.afterData}
        />
      </div>
    </>
  );
}
