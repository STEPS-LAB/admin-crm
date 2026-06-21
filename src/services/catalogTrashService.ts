import {
  brandDetailToHistorySnapshot,
  categoryDetailToHistorySnapshot,
  entityDisplayName,
  pageDetailToHistorySnapshot,
  productDetailToHistorySnapshot,
} from "@/lib/history/snapshots";
import { findCatalogTrashItems } from "@/repositories/catalogTrashRepository";
import {
  findCategoryById,
  findDeletedCategoryById,
  restoreCategoryById,
  slugExists as categorySlugExists,
} from "@/repositories/categoryRepository";
import {
  findDeletedBrandById,
  restoreBrandById,
  slugExists as brandSlugExists,
} from "@/repositories/brandRepository";
import {
  findDeletedPageById,
  restorePageById,
  slugExists as pageSlugExists,
} from "@/repositories/pageRepository";
import {
  findDeletedProductById,
  restoreProductById,
  skuExists,
  slugExists as productSlugExists,
} from "@/repositories/productRepository";
import {
  recordEntityRestore,
  type HistoryMutationContext,
} from "@/services/historyService";

import type { CatalogTrashEntityType } from "@/constants/catalog";
import type { CatalogTrashListItem } from "@/types/catalog-trash";

export async function listCatalogTrash(): Promise<CatalogTrashListItem[]> {
  return findCatalogTrashItems();
}

async function assertProductCanRestore(id: string): Promise<void> {
  const existing = await findDeletedProductById(id);

  if (!existing) {
    throw new Error("Product not found in trash");
  }

  if (await skuExists(existing.sku, id)) {
    throw new Error("Cannot restore: SKU already exists");
  }

  for (const language of ["uk", "en"] as const) {
    const slug = existing.translations[language].slug;

    if (await productSlugExists(language, slug, id)) {
      throw new Error(`Cannot restore: slug "${slug}" already exists for ${language.toUpperCase()}`);
    }
  }

  if (existing.categoryId) {
    const category = await findCategoryById(existing.categoryId);

    if (!category) {
      throw new Error("Cannot restore: assigned category no longer exists");
    }
  }
}

async function assertCategoryCanRestore(id: string): Promise<void> {
  const existing = await findDeletedCategoryById(id);

  if (!existing) {
    throw new Error("Category not found in trash");
  }

  for (const language of ["uk", "en"] as const) {
    const slug = existing.translations[language].slug;

    if (await categorySlugExists(language, slug, id)) {
      throw new Error(`Cannot restore: slug "${slug}" already exists for ${language.toUpperCase()}`);
    }
  }

  if (existing.parentId) {
    const parent = await findCategoryById(existing.parentId);

    if (!parent) {
      throw new Error("Cannot restore: parent category no longer exists");
    }
  }
}

async function assertPageCanRestore(id: string): Promise<void> {
  const existing = await findDeletedPageById(id);

  if (!existing) {
    throw new Error("Page not found in trash");
  }

  for (const language of ["uk", "en"] as const) {
    const slug = existing.translations[language].slug;

    if (await pageSlugExists(language, slug, id)) {
      throw new Error(`Cannot restore: slug "${slug}" already exists for ${language.toUpperCase()}`);
    }
  }
}

async function assertBrandCanRestore(id: string): Promise<void> {
  const existing = await findDeletedBrandById(id);

  if (!existing) {
    throw new Error("Brand not found in trash");
  }

  if (await brandSlugExists(existing.slug, id)) {
    throw new Error(`Cannot restore: slug "${existing.slug}" already exists`);
  }
}

export async function restoreCatalogEntity(
  entityType: CatalogTrashEntityType,
  id: string,
  context: HistoryMutationContext,
): Promise<void> {
  switch (entityType) {
    case "product": {
      await assertProductCanRestore(id);
      const existing = await findDeletedProductById(id);

      if (!existing) {
        throw new Error("Product not found in trash");
      }

      const restored = await restoreProductById(id);

      if (!restored) {
        throw new Error("Product not found in trash");
      }

      const label = entityDisplayName(existing.translations, existing.sku);

      await recordEntityRestore(
        "product",
        id,
        `Restored product "${label}"`,
        productDetailToHistorySnapshot(existing),
        context,
      );
      return;
    }
    case "category": {
      await assertCategoryCanRestore(id);
      const existing = await findDeletedCategoryById(id);

      if (!existing) {
        throw new Error("Category not found in trash");
      }

      const restored = await restoreCategoryById(id);

      if (!restored) {
        throw new Error("Category not found in trash");
      }

      const label = entityDisplayName(existing.translations, "Category");

      await recordEntityRestore(
        "category",
        id,
        `Restored category "${label}"`,
        categoryDetailToHistorySnapshot(existing),
        context,
      );
      return;
    }
    case "page": {
      await assertPageCanRestore(id);
      const existing = await findDeletedPageById(id);

      if (!existing) {
        throw new Error("Page not found in trash");
      }

      const restored = await restorePageById(id);

      if (!restored) {
        throw new Error("Page not found in trash");
      }

      const label = entityDisplayName(existing.translations, "Page");

      await recordEntityRestore(
        "page",
        id,
        `Restored page "${label}"`,
        pageDetailToHistorySnapshot(existing),
        context,
      );
      return;
    }
    case "brand": {
      await assertBrandCanRestore(id);
      const existing = await findDeletedBrandById(id);

      if (!existing) {
        throw new Error("Brand not found in trash");
      }

      const restored = await restoreBrandById(id);

      if (!restored) {
        throw new Error("Brand not found in trash");
      }

      const label = entityDisplayName(existing.translations, "Brand");

      await recordEntityRestore(
        "brand",
        id,
        `Restored brand "${label}"`,
        brandDetailToHistorySnapshot(existing),
        context,
      );
      return;
    }
    default: {
      const exhaustive: never = entityType;
      throw new Error(`Unsupported entity type: ${exhaustive}`);
    }
  }
}
