import {
  entityDisplayName,
  productDetailToHistorySnapshot,
  productFormToHistorySnapshot,
} from "@/lib/history/snapshots";
import {
  findBrandOptions,
  findCategoryOptions,
  findProductById,
  findProducts,
  insertProduct,
  skuExists,
  slugExists,
  softDeleteProduct,
  updateProductRecord,
  updateProductStatus,
} from "@/repositories/productRepository";
import {
  assertProductCanPublish,
  assertProductStatusCanPublish,
  provisionProductSeoProfiles,
} from "@/services/publishValidationService";
import {
  recordEntityCreate,
  recordEntityDelete,
  recordEntityStatusChange,
  recordEntityUpdate,
  type HistoryMutationContext,
} from "@/services/historyService";
import { emitWebhookEvent } from "@/services/webhookService";

import type { Pagination } from "@/types";
import type {
  ProductDetail,
  ProductFormInput,
  ProductFormLookupOption,
  ProductListFilters,
  ProductListItem,
} from "@/types/products";
import type { ProductStatus } from "@/constants/products";

export interface ProductMutationResult {
  readonly id: string;
}

export interface ProductFormOptions {
  readonly categories: ProductFormLookupOption[];
  readonly brands: ProductFormLookupOption[];
}

async function buildUniqueCopySku(baseSku: string): Promise<string> {
  let candidate = `${baseSku}-copy`;
  let counter = 1;

  while (await skuExists(candidate)) {
    counter += 1;
    candidate = `${baseSku}-copy-${counter}`;
  }

  return candidate;
}

async function buildUniqueCopySlug(
  language: "uk" | "en",
  baseSlug: string,
): Promise<string> {
  let candidate = `${baseSlug}-copy`;
  let counter = 1;

  while (await slugExists(language, candidate)) {
    counter += 1;
    candidate = `${baseSlug}-copy-${counter}`;
  }

  return candidate;
}

function productFormInputFromDetail(detail: ProductDetail): ProductFormInput {
  return {
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
  };
}

async function validateUniqueIdentifiers(
  input: ProductFormInput,
  excludeProductId?: string,
): Promise<string | null> {
  if (await skuExists(input.sku, excludeProductId)) {
    return "SKU already exists";
  }

  for (const language of ["uk", "en"] as const) {
    const slug = input.translations[language].slug;

    if (await slugExists(language, slug, excludeProductId)) {
      return `Slug "${slug}" already exists for ${language.toUpperCase()}`;
    }
  }

  return null;
}

export async function listProducts(
  filters: ProductListFilters,
): Promise<Pagination<ProductListItem>> {
  return findProducts(filters);
}

export async function getProduct(id: string): Promise<ProductDetail | null> {
  return findProductById(id);
}

export async function getProductFormOptions(): Promise<ProductFormOptions> {
  const [categories, brands] = await Promise.all([findCategoryOptions(), findBrandOptions()]);

  return { categories, brands };
}

export async function createProduct(
  input: ProductFormInput,
  context: HistoryMutationContext,
): Promise<ProductMutationResult> {
  const uniqueError = await validateUniqueIdentifiers(input);

  if (uniqueError) {
    throw new Error(uniqueError);
  }

  const id = await insertProduct(input);

  await provisionProductSeoProfiles(id, {
    uk: input.translations.uk.name,
    en: input.translations.en.name,
  });

  if (input.status === "published") {
    await assertProductCanPublish(id, input);
  }

  const label = entityDisplayName(input.translations, input.sku);

  await recordEntityCreate(
    "product",
    id,
    `Created product "${label}"`,
    productFormToHistorySnapshot(input),
    context,
  );

  emitWebhookEvent("product.created", {
    id,
    status: input.status,
    sku: input.sku,
  });

  return { id };
}

export async function updateProduct(
  id: string,
  input: ProductFormInput,
  context: HistoryMutationContext,
): Promise<ProductMutationResult> {
  const existing = await findProductById(id);

  if (!existing) {
    throw new Error("Product not found");
  }

  const uniqueError = await validateUniqueIdentifiers(input, id);

  if (uniqueError) {
    throw new Error(uniqueError);
  }

  if (input.status === "published") {
    await assertProductCanPublish(id, input);
  }

  const before = productDetailToHistorySnapshot(existing);
  const after = productFormToHistorySnapshot(input);

  await updateProductRecord(id, input);

  const label = entityDisplayName(input.translations, input.sku);

  await recordEntityUpdate(
    "product",
    id,
    `Updated product "${label}"`,
    before,
    after,
    context,
  );

  emitWebhookEvent("product.updated", {
    id,
    status: input.status,
    sku: input.sku,
  });

  return { id };
}

export async function changeProductStatus(
  id: string,
  status: ProductStatus,
  context: HistoryMutationContext,
): Promise<void> {
  const existing = await findProductById(id);

  if (!existing) {
    throw new Error("Product not found");
  }

  if (status === "published") {
    await assertProductStatusCanPublish(id, productFormInputFromDetail(existing));
  }

  await updateProductStatus(id, status);

  const label = entityDisplayName(existing.translations, existing.sku);
  const summary =
    status === "published"
      ? `Published product "${label}"`
      : existing.status === "published"
        ? `Unpublished product "${label}"`
        : `Changed product "${label}" status to ${status}`;

  await recordEntityStatusChange(
    "product",
    id,
    summary,
    existing.status,
    status,
    context,
  );
}

export async function deleteProduct(id: string, context: HistoryMutationContext): Promise<void> {
  const existing = await findProductById(id);

  if (!existing) {
    throw new Error("Product not found");
  }

  const deleted = await softDeleteProduct(id);

  if (!deleted) {
    throw new Error("Product not found");
  }

  const label = entityDisplayName(existing.translations, existing.sku);

  await recordEntityDelete(
    "product",
    id,
    `Deleted product "${label}"`,
    productDetailToHistorySnapshot(existing),
    context,
  );
}

export async function duplicateProduct(
  id: string,
  context: HistoryMutationContext,
): Promise<ProductMutationResult> {
  const existing = await findProductById(id);

  if (!existing) {
    throw new Error("Product not found");
  }

  const [sku, slugUk, slugEn] = await Promise.all([
    buildUniqueCopySku(existing.sku),
    buildUniqueCopySlug("uk", existing.translations.uk.slug),
    buildUniqueCopySlug("en", existing.translations.en.slug),
  ]);

  const input: ProductFormInput = {
    sku,
    barcode: existing.barcode,
    categoryId: existing.categoryId,
    brandId: existing.brandId,
    status: "draft",
    price: existing.price,
    oldPrice: existing.oldPrice,
    currency: existing.currency,
    stockQuantity: existing.stockQuantity,
    stockStatus: existing.stockStatus,
    translations: {
      uk: {
        ...existing.translations.uk,
        name: `${existing.translations.uk.name} (Copy)`,
        slug: slugUk,
      },
      en: {
        ...existing.translations.en,
        name: `${existing.translations.en.name} (Copy)`,
        slug: slugEn,
      },
    },
  };

  return createProduct(input, context);
}
