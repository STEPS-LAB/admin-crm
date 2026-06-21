"use client";

import { Download, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { exportCatalogAction } from "@/actions/import-export/exportCatalog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATALOG_EXPORT_ENTITIES,
  CATALOG_EXPORT_ENTITY_LABELS,
  EXPORT_FORMAT_LABELS,
  EXPORT_FORMATS,
  type CatalogExportEntity,
} from "@/constants/import-export";
import { downloadExportFile } from "@/lib/import-export/download";

export function CatalogExportPanel(): React.JSX.Element {
  const [isExporting, startExport] = useTransition();
  const [entity, setEntity] = useState<CatalogExportEntity>("products");
  const [format, setFormat] = useState<(typeof EXPORT_FORMATS)[number]>("csv");

  const runExport = (): void => {
    startExport(async () => {
      const result = await exportCatalogAction(entity, format);

      if (result.success) {
        downloadExportFile(result.data);
        toast.success(`${CATALOG_EXPORT_ENTITY_LABELS[entity]} exported`);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Export catalog data</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <Select value={entity} onValueChange={(value) => setEntity(value as CatalogExportEntity)}>
            <SelectTrigger aria-label="Export entity">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATALOG_EXPORT_ENTITIES.map((item) => (
                <SelectItem key={item} value={item}>
                  {CATALOG_EXPORT_ENTITY_LABELS[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={format} onValueChange={(value) => setFormat(value as typeof format)}>
            <SelectTrigger aria-label="Export format">
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
        </div>

        <Button type="button" disabled={isExporting} onClick={runExport}>
          {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Download export
        </Button>
      </CardContent>
    </Card>
  );
}
