import type { BrandDetail, BrandFormInput } from "@/types/brands";
import type { CategoryDetail, CategoryFormInput } from "@/types/categories";
import type { PageDetail, PageFormInput } from "@/types/pages";
import type { ProductDetail, ProductFormInput } from "@/types/products";
import type { RedirectDetail, RedirectFormInput } from "@/types/seo-center";

function serializeValue(value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, serializeValue(entry)]),
    );
  }

  return value;
}

function toSnapshot<T extends Record<string, unknown>>(value: T): Record<string, unknown> {
  return serializeValue(value) as Record<string, unknown>;
}

export function productFormToHistorySnapshot(input: ProductFormInput): Record<string, unknown> {
  return toSnapshot({
    sku: input.sku,
    barcode: input.barcode,
    categoryId: input.categoryId,
    brandId: input.brandId,
    status: input.status,
    price: input.price,
    oldPrice: input.oldPrice,
    currency: input.currency,
    stockQuantity: input.stockQuantity,
    stockStatus: input.stockStatus,
    translations: input.translations,
  });
}

export function productDetailToHistorySnapshot(detail: ProductDetail): Record<string, unknown> {
  return productFormToHistorySnapshot({
    sku: detail.sku,
    barcode: detail.barcode,
    categoryId: detail.categoryId,
    brandId: detail.brandId,
    status: detail.status,
    price: detail.price,
    oldPrice: detail.oldPrice,
    currency: detail.currency,
    stockQuantity: detail.stockQuantity,
    stockStatus: detail.stockStatus,
    translations: detail.translations,
  });
}

export function categoryFormToHistorySnapshot(input: CategoryFormInput): Record<string, unknown> {
  return toSnapshot({
    parentId: input.parentId,
    sortOrder: input.sortOrder,
    status: input.status,
    translations: input.translations,
  });
}

export function categoryDetailToHistorySnapshot(detail: CategoryDetail): Record<string, unknown> {
  return categoryFormToHistorySnapshot({
    parentId: detail.parentId,
    sortOrder: detail.sortOrder,
    status: detail.status,
    translations: detail.translations,
  });
}

export function redirectFormToHistorySnapshot(input: RedirectFormInput): Record<string, unknown> {
  return toSnapshot({
    source: input.source,
    destination: input.destination,
    statusCode: input.statusCode,
    enabled: input.enabled,
  });
}

export function redirectDetailToHistorySnapshot(detail: RedirectDetail): Record<string, unknown> {
  return redirectFormToHistorySnapshot({
    source: detail.source,
    destination: detail.destination,
    statusCode: detail.statusCode,
    enabled: detail.enabled,
  });
}

export function pageFormToHistorySnapshot(input: PageFormInput): Record<string, unknown> {
  return toSnapshot({
    pageType: input.pageType,
    status: input.status,
    isHomepage: input.isHomepage,
    sortOrder: input.sortOrder,
    translations: input.translations,
  });
}

export function pageDetailToHistorySnapshot(detail: PageDetail): Record<string, unknown> {
  return pageFormToHistorySnapshot({
    pageType: detail.pageType,
    status: detail.status,
    isHomepage: detail.isHomepage,
    sortOrder: detail.sortOrder,
    translations: detail.translations,
  });
}

export function brandFormToHistorySnapshot(input: BrandFormInput): Record<string, unknown> {
  return toSnapshot({
    slug: input.slug,
    logoUrl: input.logoUrl,
    website: input.website,
    country: input.country,
    status: input.status,
    translations: input.translations,
  });
}

export function brandDetailToHistorySnapshot(detail: BrandDetail): Record<string, unknown> {
  return brandFormToHistorySnapshot({
    slug: detail.slug,
    logoUrl: detail.logoUrl,
    website: detail.website,
    country: detail.country,
    status: detail.status,
    translations: detail.translations,
  });
}

export function entityDisplayName(
  translations: { readonly uk: { readonly name?: string; readonly title?: string } },
  fallback: string,
): string {
  const label = translations.uk.name ?? translations.uk.title;
  return label?.trim() || fallback;
}
