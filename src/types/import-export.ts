import type {
  AuditExportSource,
  CatalogExportEntity,
  CatalogImportEntity,
  ExportFormat,
} from "@/constants/import-export";

export interface ExportFilePayload {
  readonly filename: string;
  readonly mimeType: string;
  readonly content: string;
}

export interface ImportRowIssue {
  readonly row: number;
  readonly field?: string | undefined;
  readonly message: string;
}

export interface ImportPreviewRow {
  readonly row: number;
  readonly action: "create" | "update" | "skip";
  readonly label: string;
  readonly issues: readonly ImportRowIssue[];
}

export interface CatalogImportPreview {
  readonly entity: CatalogImportEntity;
  readonly format: ExportFormat;
  readonly totalRows: number;
  readonly validRows: number;
  readonly invalidRows: number;
  readonly createCount: number;
  readonly updateCount: number;
  readonly preview: readonly ImportPreviewRow[];
  readonly issues: readonly ImportRowIssue[];
  readonly rows: readonly Record<string, unknown>[];
}

export interface CatalogImportCommitResult {
  readonly entity: CatalogImportEntity;
  readonly createdIds: readonly string[];
  readonly updatedIds: readonly string[];
  readonly failedCount: number;
  readonly errors: readonly ImportRowIssue[];
}

export interface CatalogImportRollbackResult {
  readonly rolledBackProducts: number;
  readonly rolledBackCategories: number;
}

export interface CatalogExportRequest {
  readonly entity: CatalogExportEntity;
  readonly format: ExportFormat;
}

export interface AuditExportRequest {
  readonly source: AuditExportSource;
  readonly format: ExportFormat;
  readonly search?: string | undefined;
  readonly entityType?: string | undefined;
  readonly operation?: string | undefined;
  readonly action?: string | undefined;
}
