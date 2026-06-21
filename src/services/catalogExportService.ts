import {
  CATEGORY_IMPORT_CSV_HEADERS,
  PRODUCT_IMPORT_CSV_HEADERS,
} from "@/constants/import-export";
import { stringifyCsv } from "@/lib/import-export/csv";
import {
  findCategoriesForExport,
  findProductsForExport,
} from "@/repositories/catalogExportRepository";
import { exportSettingsSnapshot } from "@/services/settingsExportService";
import { emitWebhookEvent } from "@/services/webhookService";

import type { CatalogExportRequest, ExportFilePayload } from "@/types/import-export";

function buildFilename(entity: CatalogExportRequest["entity"], format: CatalogExportRequest["format"]): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${entity}-export-${timestamp}.${format}`;
}

function productRowsToCsv(rows: Awaited<ReturnType<typeof findProductsForExport>>): string {
  return stringifyCsv(
    PRODUCT_IMPORT_CSV_HEADERS,
    rows.map((row) => ({
      sku: row.sku,
      barcode: row.barcode,
      category_slug: row.categorySlug,
      brand_slug: row.brandSlug,
      status: row.status,
      price: row.price,
      old_price: row.oldPrice,
      currency: row.currency,
      stock_quantity: row.stockQuantity,
      stock_status: row.stockStatus,
      name_uk: row.nameUk,
      slug_uk: row.slugUk,
      short_description_uk: row.shortDescriptionUk,
      description_uk: row.descriptionUk,
      name_en: row.nameEn,
      slug_en: row.slugEn,
      short_description_en: row.shortDescriptionEn,
      description_en: row.descriptionEn,
    })),
  );
}

function categoryRowsToCsv(rows: Awaited<ReturnType<typeof findCategoriesForExport>>): string {
  return stringifyCsv(
    CATEGORY_IMPORT_CSV_HEADERS,
    rows.map((row) => ({
      parent_slug: row.parentSlug,
      sort_order: row.sortOrder,
      status: row.status,
      name_uk: row.nameUk,
      slug_uk: row.slugUk,
      description_uk: row.descriptionUk,
      name_en: row.nameEn,
      slug_en: row.slugEn,
      description_en: row.descriptionEn,
    })),
  );
}

export async function exportCatalogData(request: CatalogExportRequest): Promise<ExportFilePayload> {
  let payload: ExportFilePayload;

  if (request.entity === "settings") {
    payload = await exportSettingsSnapshot(request.format);
  } else if (request.entity === "products") {
    const rows = await findProductsForExport();

    if (request.format === "json") {
      payload = {
        filename: buildFilename(request.entity, request.format),
        mimeType: "application/json",
        content: JSON.stringify(
          {
            entity: "products",
            rows: rows.map((row) => ({
              sku: row.sku,
              barcode: row.barcode,
              category_slug: row.categorySlug,
              brand_slug: row.brandSlug,
              status: row.status,
              price: row.price,
              old_price: row.oldPrice,
              currency: row.currency,
              stock_quantity: row.stockQuantity,
              stock_status: row.stockStatus,
              name_uk: row.nameUk,
              slug_uk: row.slugUk,
              short_description_uk: row.shortDescriptionUk,
              description_uk: row.descriptionUk,
              name_en: row.nameEn,
              slug_en: row.slugEn,
              short_description_en: row.shortDescriptionEn,
              description_en: row.descriptionEn,
            })),
          },
          null,
          2,
        ),
      };
    } else {
      payload = {
        filename: buildFilename(request.entity, request.format),
        mimeType: "text/csv;charset=utf-8",
        content: productRowsToCsv(rows),
      };
    }
  } else {
    const rows = await findCategoriesForExport();

    if (request.format === "json") {
      payload = {
        filename: buildFilename(request.entity, request.format),
        mimeType: "application/json",
        content: JSON.stringify(
          {
            entity: "categories",
            rows: rows.map((row) => ({
              parent_slug: row.parentSlug,
              sort_order: row.sortOrder,
              status: row.status,
              name_uk: row.nameUk,
              slug_uk: row.slugUk,
              description_uk: row.descriptionUk,
              name_en: row.nameEn,
              slug_en: row.slugEn,
              description_en: row.descriptionEn,
            })),
          },
          null,
          2,
        ),
      };
    } else {
      payload = {
        filename: buildFilename(request.entity, request.format),
        mimeType: "text/csv;charset=utf-8",
        content: categoryRowsToCsv(rows),
      };
    }
  }

  emitWebhookEvent("export.completed", {
    entity: request.entity,
    format: request.format,
    filename: payload.filename,
  });

  return payload;
}
