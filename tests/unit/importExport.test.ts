import { describe, expect, it } from "vitest";

import { parseCsv, stringifyCsv } from "@/lib/import-export/csv";
import { maskRecord } from "@/lib/import-export/maskSensitiveData";
import { productImportRowSchema } from "@/schemas/import-export/importExportSchemas";

describe("parseCsv", () => {
  it("parses quoted values with commas", () => {
    const result = parseCsv('sku,name\n"abc,123","Widget"');

    expect(result.headers).toEqual(["sku", "name"]);
    expect(result.rows[0]).toEqual({
      sku: "abc,123",
      name: "Widget",
    });
  });
});

describe("stringifyCsv", () => {
  it("escapes values that contain commas", () => {
    const csv = stringifyCsv(["sku", "name"], [{ sku: "abc,123", name: "Widget" }]);

    expect(csv).toContain('"abc,123"');
  });
});

describe("maskRecord", () => {
  it("redacts sensitive keys", () => {
    const masked = maskRecord({
      siteName: "SEO CMS",
      smtpPasswordEncrypted: "secret-value",
      nested: {
        apiKey: "abc",
      },
    });

    expect(masked.siteName).toBe("SEO CMS");
    expect(masked.smtpPasswordEncrypted).toBe("[REDACTED]");
    expect((masked.nested as Record<string, unknown>).apiKey).toBe("[REDACTED]");
  });
});

describe("productImportRowSchema", () => {
  it("accepts a valid product import row", () => {
    const result = productImportRowSchema.safeParse({
      sku: "SKU-1",
      barcode: "",
      category_slug: "phones",
      brand_slug: "",
      status: "draft",
      price: "100.00",
      old_price: "",
      currency: "UAH",
      stock_quantity: "5",
      stock_status: "in_stock",
      name_uk: "Телефон",
      slug_uk: "telefon",
      short_description_uk: "",
      description_uk: "",
      name_en: "Phone",
      slug_en: "phone",
      short_description_en: "",
      description_en: "",
    });

    expect(result.success).toBe(true);
  });
});
