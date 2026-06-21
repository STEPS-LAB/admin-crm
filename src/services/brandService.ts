import {
  brandDetailToHistorySnapshot,
  brandFormToHistorySnapshot,
  entityDisplayName,
} from "@/lib/history/snapshots";
import {
  findBrandById,
  findBrands,
  insertBrand,
  slugExists,
  softDeleteBrand,
  updateBrandRecord,
  updateBrandStatus,
} from "@/repositories/brandRepository";
import {
  assertBrandCanPublish,
  assertBrandStatusCanPublish,
  provisionBrandSeoProfiles,
} from "@/services/publishValidationService";
import {
  recordEntityCreate,
  recordEntityDelete,
  recordEntityStatusChange,
  recordEntityUpdate,
  type HistoryMutationContext,
} from "@/services/historyService";

import type { Pagination } from "@/types";
import type { BrandDetail, BrandFormInput, BrandListFilters, BrandListItem } from "@/types/brands";
import type { BrandStatus } from "@/constants/brands";

export interface BrandMutationResult {
  readonly id: string;
}

function brandFormInputFromDetail(detail: BrandDetail): BrandFormInput {
  return {
    slug: detail.slug,
    logoUrl: detail.logoUrl,
    website: detail.website,
    country: detail.country,
    status: detail.status,
    translations: detail.translations,
  };
}

async function validateUniqueSlug(input: BrandFormInput, excludeBrandId?: string): Promise<string | null> {
  if (await slugExists(input.slug, excludeBrandId)) {
    return `Slug "${input.slug}" already exists`;
  }

  return null;
}

export async function listBrands(filters: BrandListFilters): Promise<Pagination<BrandListItem>> {
  return findBrands(filters);
}

export async function getBrand(id: string): Promise<BrandDetail | null> {
  return findBrandById(id);
}

export async function createBrand(
  input: BrandFormInput,
  context: HistoryMutationContext,
): Promise<BrandMutationResult> {
  const slugError = await validateUniqueSlug(input);

  if (slugError) {
    throw new Error(slugError);
  }

  const id = await insertBrand(input);

  await provisionBrandSeoProfiles(id, {
    uk: input.translations.uk.name,
    en: input.translations.en.name,
  });

  if (input.status === "published") {
    await assertBrandCanPublish(id, input);
  }

  const label = entityDisplayName(input.translations, "Brand");

  await recordEntityCreate(
    "brand",
    id,
    `Created brand "${label}"`,
    brandFormToHistorySnapshot(input),
    context,
  );

  return { id };
}

export async function updateBrand(
  id: string,
  input: BrandFormInput,
  context: HistoryMutationContext,
): Promise<BrandMutationResult> {
  const existing = await findBrandById(id);

  if (!existing) {
    throw new Error("Brand not found");
  }

  const slugError = await validateUniqueSlug(input, id);

  if (slugError) {
    throw new Error(slugError);
  }

  if (input.status === "published") {
    await assertBrandCanPublish(id, input);
  }

  const before = brandDetailToHistorySnapshot(existing);
  const after = brandFormToHistorySnapshot(input);

  await updateBrandRecord(id, input);

  const label = entityDisplayName(input.translations, "Brand");

  await recordEntityUpdate("brand", id, `Updated brand "${label}"`, before, after, context);

  return { id };
}

export async function changeBrandStatus(
  id: string,
  status: BrandStatus,
  context: HistoryMutationContext,
): Promise<void> {
  const existing = await findBrandById(id);

  if (!existing) {
    throw new Error("Brand not found");
  }

  if (status === "published") {
    await assertBrandStatusCanPublish(id, brandFormInputFromDetail(existing));
  }

  await updateBrandStatus(id, status);

  const label = entityDisplayName(existing.translations, "Brand");
  const summary =
    status === "published"
      ? `Published brand "${label}"`
      : existing.status === "published"
        ? `Unpublished brand "${label}"`
        : `Changed brand "${label}" status to ${status}`;

  await recordEntityStatusChange("brand", id, summary, existing.status, status, context);
}

export async function deleteBrand(id: string, context: HistoryMutationContext): Promise<void> {
  const existing = await findBrandById(id);

  if (!existing) {
    throw new Error("Brand not found");
  }

  if (existing.productCount > 0) {
    throw new Error("Cannot delete a brand that has products");
  }

  const deleted = await softDeleteBrand(id);

  if (!deleted) {
    throw new Error("Brand not found");
  }

  const label = entityDisplayName(existing.translations, "Brand");

  await recordEntityDelete(
    "brand",
    id,
    `Deleted brand "${label}"`,
    brandDetailToHistorySnapshot(existing),
    context,
  );
}
