"use client";

import { Download, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { exportAuditAction } from "@/actions/import-export/exportAudit";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AUDIT_EXPORT_SOURCE_LABELS,
  EXPORT_FORMAT_LABELS,
  EXPORT_FORMATS,
  type AuditExportSource,
} from "@/constants/import-export";
import { downloadExportFile } from "@/lib/import-export/download";

export interface AuditExportControlsProps {
  readonly source: AuditExportSource;
}

export function AuditExportControls({ source }: AuditExportControlsProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const [isExporting, startExport] = useTransition();
  const [format, setFormat] = useState<(typeof EXPORT_FORMATS)[number]>("csv");

  const runExport = (): void => {
    startExport(async () => {
      const result = await exportAuditAction({
        source,
        format,
        q: searchParams.get("q") ?? undefined,
        entityType: searchParams.get("entityType") ?? undefined,
        operation: searchParams.get("operation") ?? undefined,
        action: searchParams.get("action") ?? undefined,
      });

      if (result.success) {
        downloadExportFile(result.data);
        toast.success(`${AUDIT_EXPORT_SOURCE_LABELS[source]} exported`);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={format} onValueChange={(value) => setFormat(value as typeof format)}>
        <SelectTrigger className="w-[120px]" aria-label="Export format">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {EXPORT_FORMATS.map((item) => (
            <SelectItem key={item} value={item}>
              {EXPORT_FORMAT_LABELS[item]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="button" variant="outline" disabled={isExporting} onClick={runExport}>
        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
        Export {AUDIT_EXPORT_SOURCE_LABELS[source].toLowerCase()}
      </Button>
    </div>
  );
}
