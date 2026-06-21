import { randomUUID } from "node:crypto";

import {
  CATEGORY_IMPORT_CSV_HEADERS,
  IMPORT_EXPORT_LIMITS,
  PRODUCT_IMPORT_CSV_HEADERS,
  type CatalogImportEntity,
  type ExportFormat,
} from "@/constants/import-export";
import { parseCsv } from "@/lib/import-export/csv";
import {
  findBrandIdBySlug,
  findCategoryIdByUkSlug,
  findProductIdBySku,
} from "@/repositories/catalogExportRepository";
import { findSettings } from "@/repositories/settingsRepository";
import { createCategory, deleteCategory, updateCategory } from "@/services/categoryService";
import { recordHistoryEntry, type HistoryMutationContext } from "@/services/historyService";
import { createProduct, deleteProduct, updateProduct } from "@/services/productService";
import { emitWebhookEvent } from "@/services/webhookService";
import {
  categoryImportRowSchema,
  productImportRowSchema,
  type CategoryImportRow,
  type ProductImportRow,
} from "@/schemas/import-export/importExportSchemas";

import type {
  CatalogImportCommitResult,
  CatalogImportPreview,
  CatalogImportRollbackResult,
  ImportPreviewRow,
  ImportRowIssue,
} from "@/types/import-export";
import type { CategoryFormInput } from "@/types/categories";
import type { ProductFormInput } from "@/types/products";

function normalizeImportRecord(record: Record<string, unknown>): Record<string, string> {
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(record)) {
    normalized[key.toLowerCase()] = value === null || value === undefined ? "" : String(value);
  }

  return normalized;
}

function parseImportRows(
  entity: CatalogImportEntity,
  format: ExportFormat,
  content: string,
): Record<string, string>[] {
  if (format === "json") {
    const parsed = JSON.parse(content) as unknown;

    if (Array.isArray(parsed)) {
      return parsed.map((row) => normalizeImportRecord(row as Record<string, unknown>));
    }

    if (
      parsed &&
      typeof parsed === "object" &&
      "rows" in parsed &&
      Array.isArray((parsed as { rows: unknown }).rows)
    ) {
      return (parsed as { rows: Record<string, unknown>[] }).rows.map((row) =>
        normalizeImportRecord(row),
      );
    }

    throw new Error("JSON import must be an array or an object with a rows array");
  }

  const { headers, rows } = parseCsv(content);
  const expectedHeaders =
    entity === "products" ? PRODUCT_IMPORT_CSV_HEADERS : CATEGORY_IMPORT_CSV_HEADERS;
  const missingHeaders = expectedHeaders.filter((header) => !headers.includes(header));

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);
  }

  return rows;
}

function zodIssuesToImportIssues(
  row: number,
  error: { path: (string | number)[]; message: string },
): ImportRowIssue {
  return {
    row,
    field: error.path[0] ? String(error.path[0]) : undefined,
    message: error.message,
  };
}

async function resolveProductInput(row: ProductImportRow): Promise<{
  readonly input: ProductFormInput;
  readonly issues: ImportRowIssue[];
}> {
  const issues: ImportRowIssue[] = [];
  const categoryId = await findCategoryIdByUkSlug(row.category_slug);

  if (!categoryId) {
    issues.push({
      row: 0,
      field: "category_slug",
      message: `Category slug "${row.category_slug}" was not found`,
    });
  }

  let brandId: string | null = null;

  if (row.brand_slug) {
    brandId = await findBrandIdBySlug(row.brand_slug);

    if (!brandId) {
      issues.push({
        row: 0,
        field: "brand_slug",
        message: `Brand slug "${row.brand_slug}" was not found`,
      });
    }
  }

  if (issues.length > 0 || !categoryId) {
    return {
      input: {
        sku: row.sku,
        barcode: row.barcode,
        categoryId: categoryId ?? "00000000-0000-0000-0000-000000000000",
        brandId,
        status: row.status,
        price: row.price,
        oldPrice: row.old_price,
        currency: row.currency,
        stockQuantity: row.stock_quantity,
        stockStatus: row.stock_status,
        translations: {
          uk: {
            name: row.name_uk,
            slug: row.slug_uk,
            shortDescription: row.short_description_uk,
            description: row.description_uk,
          },
          en: {
            name: row.name_en,
            slug: row.slug_en,
            shortDescription: row.short_description_en,
            description: row.description_en,
          },
        },
      },
      issues,
    };
  }

  return {
    input: {
      sku: row.sku,
      barcode: row.barcode,
      categoryId,
      brandId,
      status: row.status,
      price: row.price,
      oldPrice: row.old_price,
      currency: row.currency,
      stockQuantity: row.stock_quantity,
      stockStatus: row.stock_status,
      translations: {
        uk: {
          name: row.name_uk,
          slug: row.slug_uk,
          shortDescription: row.short_description_uk,
          description: row.description_uk,
        },
        en: {
          name: row.name_en,
          slug: row.slug_en,
          shortDescription: row.short_description_en,
          description: row.description_en,
        },
      },
    },
    issues,
  };
}

async function resolveCategoryInput(row: CategoryImportRow): Promise<{
  readonly input: CategoryFormInput;
  readonly issues: ImportRowIssue[];
}> {
  const issues: ImportRowIssue[] = [];
  let parentId: string | null = null;

  if (row.parent_slug) {
    parentId = await findCategoryIdByUkSlug(row.parent_slug);

    if (!parentId) {
      issues.push({
        row: 0,
        field: "parent_slug",
        message: `Parent category slug "${row.parent_slug}" was not found`,
      });
    }
  }

  return {
    input: {
      parentId,
      sortOrder: row.sort_order,
      status: row.status,
      translations: {
        uk: {
          name: row.name_uk,
          slug: row.slug_uk,
          description: row.description_uk,
        },
        en: {
          name: row.name_en,
          slug: row.slug_en,
          description: row.description_en,
        },
      },
    },
    issues,
  };
}

async function buildProductPreview(
  rawRows: Record<string, string>[],
): Promise<CatalogImportPreview> {
  const issues: ImportRowIssue[] = [];
  const preview: ImportPreviewRow[] = [];
  const validRows: Record<string, unknown>[] = [];
  let createCount = 0;
  let updateCount = 0;
  let invalidRows = 0;

  for (let index = 0; index < rawRows.length; index += 1) {
    const rowNumber = index + 2;
    const parsed = productImportRowSchema.safeParse(rawRows[index]);

    if (!parsed.success) {
      invalidRows += 1;
      const rowIssues = parsed.error.errors.map((error) => zodIssuesToImportIssues(rowNumber, error));
      issues.push(...rowIssues);
      preview.push({
        row: rowNumber,
        action: "skip",
        label: rawRows[index]?.sku || `Row ${rowNumber}`,
        issues: rowIssues,
      });
      continue;
    }

    const resolved = await resolveProductInput(parsed.data);
    const rowIssues = resolved.issues.map((issue) => ({ ...issue, row: rowNumber }));

    if (rowIssues.length > 0) {
      invalidRows += 1;
      issues.push(...rowIssues);
      preview.push({
        row: rowNumber,
        action: "skip",
        label: parsed.data.sku,
        issues: rowIssues,
      });
      continue;
    }

    const existingId = await findProductIdBySku(parsed.data.sku);
    const action = existingId ? "update" : "create";

    if (action === "create") {
      createCount += 1;
    } else {
      updateCount += 1;
    }

    validRows.push(parsed.data);
    preview.push({
      row: rowNumber,
      action,
      label: parsed.data.sku,
      issues: [],
    });
  }

  return {
    entity: "products",
    format: "csv",
    totalRows: rawRows.length,
    validRows: validRows.length,
    invalidRows,
    createCount,
    updateCount,
    preview: preview.slice(0, IMPORT_EXPORT_LIMITS.previewRowLimit),
    issues,
    rows: validRows,
  };
}

async function buildCategoryPreview(
  rawRows: Record<string, string>[],
): Promise<CatalogImportPreview> {
  const issues: ImportRowIssue[] = [];
  const preview: ImportPreviewRow[] = [];
  const validRows: Record<string, unknown>[] = [];
  let createCount = 0;
  let updateCount = 0;
  let invalidRows = 0;

  for (let index = 0; index < rawRows.length; index += 1) {
    const rowNumber = index + 2;
    const parsed = categoryImportRowSchema.safeParse(rawRows[index]);

    if (!parsed.success) {
      invalidRows += 1;
      const rowIssues = parsed.error.errors.map((error) => zodIssuesToImportIssues(rowNumber, error));
      issues.push(...rowIssues);
      preview.push({
        row: rowNumber,
        action: "skip",
        label: rawRows[index]?.slug_uk || `Row ${rowNumber}`,
        issues: rowIssues,
      });
      continue;
    }

    const resolved = await resolveCategoryInput(parsed.data);
    const rowIssues = resolved.issues.map((issue) => ({ ...issue, row: rowNumber }));

    if (rowIssues.length > 0) {
      invalidRows += 1;
      issues.push(...rowIssues);
      preview.push({
        row: rowNumber,
        action: "skip",
        label: parsed.data.slug_uk,
        issues: rowIssues,
      });
      continue;
    }

    const existingId = await findCategoryIdByUkSlug(parsed.data.slug_uk);
    const action = existingId ? "update" : "create";

    if (action === "create") {
      createCount += 1;
    } else {
      updateCount += 1;
    }

    validRows.push(parsed.data);
    preview.push({
      row: rowNumber,
      action,
      label: parsed.data.slug_uk,
      issues: [],
    });
  }

  return {
    entity: "categories",
    format: "csv",
    totalRows: rawRows.length,
    validRows: validRows.length,
    invalidRows,
    createCount,
    updateCount,
    preview: preview.slice(0, IMPORT_EXPORT_LIMITS.previewRowLimit),
    issues,
    rows: validRows,
  };
}

export async function previewCatalogImport(
  entity: CatalogImportEntity,
  format: ExportFormat,
  content: string,
): Promise<CatalogImportPreview> {
  const rawRows = parseImportRows(entity, format, content);

  if (rawRows.length === 0) {
    throw new Error("Import file does not contain any rows");
  }

  if (rawRows.length > IMPORT_EXPORT_LIMITS.maxImportRows) {
    throw new Error(`Import exceeds maximum of ${IMPORT_EXPORT_LIMITS.maxImportRows} rows`);
  }

  const preview =
    entity === "products"
      ? await buildProductPreview(rawRows)
      : await buildCategoryPreview(rawRows);

  return {
    ...preview,
    entity,
    format,
  };
}

async function recordImportAudit(
  entity: CatalogImportEntity,
  result: CatalogImportCommitResult,
  context: HistoryMutationContext,
): Promise<void> {
  const settings = await findSettings();

  await recordHistoryEntry({
    entityType: "system",
    entityId: settings?.id ?? randomUUID(),
    operation: "import",
    changeSummary: `Imported ${entity}: ${result.createdIds.length} created, ${result.updatedIds.length} updated, ${result.failedCount} failed`,
    afterData: {
      entity,
      createdIds: result.createdIds,
      updatedIds: result.updatedIds,
      failedCount: result.failedCount,
    },
    context,
  });
}

export async function commitCatalogImport(
  entity: CatalogImportEntity,
  rows: readonly Record<string, unknown>[],
  context: HistoryMutationContext,
): Promise<CatalogImportCommitResult> {
  const createdIds: string[] = [];
  const updatedIds: string[] = [];
  const errors: ImportRowIssue[] = [];

  if (entity === "products") {
    for (let index = 0; index < rows.length; index += 1) {
      const parsed = productImportRowSchema.safeParse(rows[index]);

      if (!parsed.success) {
        errors.push(
          ...parsed.error.errors.map((error) => zodIssuesToImportIssues(index + 1, error)),
        );
        continue;
      }

      const resolved = await resolveProductInput(parsed.data);

      if (resolved.issues.length > 0) {
        errors.push(...resolved.issues.map((issue) => ({ ...issue, row: index + 1 })));
        continue;
      }

      try {
        const existingId = await findProductIdBySku(parsed.data.sku);

        if (existingId) {
          await updateProduct(existingId, resolved.input, context);
          updatedIds.push(existingId);
        } else {
          const created = await createProduct(resolved.input, context);
          createdIds.push(created.id);
        }
      } catch (error) {
        errors.push({
          row: index + 1,
          message: error instanceof Error ? error.message : "Import failed",
        });
      }
    }
  } else {
    for (let index = 0; index < rows.length; index += 1) {
      const parsed = categoryImportRowSchema.safeParse(rows[index]);

      if (!parsed.success) {
        errors.push(
          ...parsed.error.errors.map((error) => zodIssuesToImportIssues(index + 1, error)),
        );
        continue;
      }

      const resolved = await resolveCategoryInput(parsed.data);

      if (resolved.issues.length > 0) {
        errors.push(...resolved.issues.map((issue) => ({ ...issue, row: index + 1 })));
        continue;
      }

      try {
        const existingId = await findCategoryIdByUkSlug(parsed.data.slug_uk);

        if (existingId) {
          await updateCategory(existingId, resolved.input, context);
          updatedIds.push(existingId);
        } else {
          const created = await createCategory(resolved.input, context);
          createdIds.push(created.id);
        }
      } catch (error) {
        errors.push({
          row: index + 1,
          message: error instanceof Error ? error.message : "Import failed",
        });
      }
    }
  }

  const result: CatalogImportCommitResult = {
    entity,
    createdIds,
    updatedIds,
    failedCount: errors.length,
    errors,
  };

  await recordImportAudit(entity, result, context);

  emitWebhookEvent("import.completed", {
    entity,
    created: createdIds.length,
    updated: updatedIds.length,
    failed: errors.length,
  });

  return result;
}

export async function rollbackCatalogImport(
  createdProductIds: readonly string[],
  createdCategoryIds: readonly string[],
  context: HistoryMutationContext,
): Promise<CatalogImportRollbackResult> {
  let rolledBackProducts = 0;
  let rolledBackCategories = 0;

  for (const productId of createdProductIds) {
    try {
      await deleteProduct(productId, context);
      rolledBackProducts += 1;
    } catch {
      // Skip entities that cannot be rolled back.
    }
  }

  for (const categoryId of [...createdCategoryIds].reverse()) {
    try {
      await deleteCategory(categoryId, context);
      rolledBackCategories += 1;
    } catch {
      // Skip entities that cannot be rolled back.
    }
  }

  return {
    rolledBackProducts,
    rolledBackCategories,
  };
}
