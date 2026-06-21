"use client";

import { Loader2, RotateCcw, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  commitCatalogImportAction,
  previewCatalogImportAction,
  rollbackCatalogImportAction,
} from "@/actions/import-export/importCatalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATALOG_IMPORT_ENTITIES,
  CATALOG_IMPORT_ENTITY_LABELS,
  EXPORT_FORMAT_LABELS,
  EXPORT_FORMATS,
  type CatalogImportEntity,
} from "@/constants/import-export";

import type { CatalogImportPreview } from "@/types/import-export";

export function CatalogImportPanel(): React.JSX.Element {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [entity, setEntity] = useState<CatalogImportEntity>("products");
  const [format, setFormat] = useState<(typeof EXPORT_FORMATS)[number]>("csv");
  const [preview, setPreview] = useState<CatalogImportPreview | null>(null);
  const [rollbackIds, setRollbackIds] = useState<{
    products: string[];
    categories: string[];
  } | null>(null);
  const [isWorking, startWork] = useTransition();

  const readFile = async (file: File): Promise<void> => {
    const content = await file.text();

    startWork(async () => {
      const result = await previewCatalogImportAction(entity, format, content);

      if (result.success) {
        setPreview(result.data);
        setRollbackIds(null);
        toast.success("Import preview ready");
      } else {
        setPreview(null);
        toast.error(result.error);
      }
    });
  };

  const runCommit = (): void => {
    if (!preview || preview.rows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }

    startWork(async () => {
      const result = await commitCatalogImportAction(
        preview.entity,
        preview.rows as Record<string, unknown>[],
      );

      if (result.success) {
        setRollbackIds({
          products: preview.entity === "products" ? [...result.data.createdIds] : [],
          categories: preview.entity === "categories" ? [...result.data.createdIds] : [],
        });
        setPreview(null);
        toast.success(
          `Imported ${result.data.createdIds.length} new and updated ${result.data.updatedIds.length} records`,
        );
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const runRollback = (): void => {
    if (!rollbackIds) {
      return;
    }

    startWork(async () => {
      const result = await rollbackCatalogImportAction(
        rollbackIds.products,
        rollbackIds.categories,
      );

      if (result.success) {
        toast.success(
          `Rolled back ${result.data.rolledBackProducts + result.data.rolledBackCategories} created records`,
        );
        setRollbackIds(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Import catalog data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Select value={entity} onValueChange={(value) => setEntity(value as CatalogImportEntity)}>
            <SelectTrigger aria-label="Import entity">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATALOG_IMPORT_ENTITIES.map((item) => (
                <SelectItem key={item} value={item}>
                  {CATALOG_IMPORT_ENTITY_LABELS[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={format} onValueChange={(value) => setFormat(value as typeof format)}>
            <SelectTrigger aria-label="Import format">
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            ref={fileInputRef}
            type="file"
            accept={format === "json" ? "application/json,.json" : "text/csv,.csv"}
            className="max-w-md"
            aria-label="Import file"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                void readFile(file);
              }

              event.target.value = "";
            }}
          />
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Choose file
          </Button>
        </div>

        {preview ? (
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{preview.totalRows} rows</Badge>
              <Badge variant="success">{preview.validRows} valid</Badge>
              <Badge variant={preview.invalidRows > 0 ? "destructive" : "outline"}>
                {preview.invalidRows} invalid
              </Badge>
              <Badge variant="outline">{preview.createCount} create</Badge>
              <Badge variant="outline">{preview.updateCount} update</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-2 py-2">Row</th>
                    <th className="px-2 py-2">Action</th>
                    <th className="px-2 py-2">Label</th>
                    <th className="px-2 py-2">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.preview.map((row) => (
                    <tr key={row.row} className="border-b border-border/60">
                      <td className="px-2 py-2">{row.row}</td>
                      <td className="px-2 py-2 capitalize">{row.action}</td>
                      <td className="px-2 py-2">{row.label}</td>
                      <td className="px-2 py-2 text-muted-foreground">
                        {row.issues.length > 0 ? row.issues.map((issue) => issue.message).join("; ") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {preview.issues.length > preview.preview.length ? (
              <p className="text-xs text-muted-foreground">
                Showing the first {preview.preview.length} preview rows. Fix validation issues before importing.
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={isWorking || preview.validRows === 0} onClick={runCommit}>
                {isWorking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Commit import
              </Button>
            </div>
          </div>
        ) : null}

        {rollbackIds ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-warning/40 bg-warning/5 p-4">
            <p className="text-sm">
              Rollback is available for records created in the last import batch.
            </p>
            <Button type="button" variant="outline" disabled={isWorking} onClick={runRollback}>
              {isWorking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
              Rollback import
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
