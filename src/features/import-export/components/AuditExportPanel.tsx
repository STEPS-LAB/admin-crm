import { Suspense } from "react";

import { AuditExportControls } from "@/features/import-export/components/AuditExportControls";

import type { AuditExportSource } from "@/constants/import-export";

export interface AuditExportPanelProps {
  readonly source: AuditExportSource;
}

export function AuditExportPanel({ source }: AuditExportPanelProps): React.JSX.Element {
  return (
    <Suspense fallback={<div className="h-9 w-40 animate-pulse rounded-md bg-muted" />}>
      <AuditExportControls source={source} />
    </Suspense>
  );
}
