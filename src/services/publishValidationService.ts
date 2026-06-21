import {
  mergePublishValidationResults,
  validateBrandPublishInput,
  validateCategoryPublishInput,
  validatePagePublishInput,
  validateProductPublishInput,
} from "@/lib/catalog/publishValidation";
import { formatPublishValidationError } from "@/types/publish-validation";
import { ownerHasCover } from "@/repositories/mediaUsageRepository";
import {
  ensureOwnerSeoProfiles,
  ownerSeoProfilesAreComplete,
} from "@/repositories/seoProfileRepository";

import type { BrandFormInput } from "@/types/brands";
import type { CategoryFormInput } from "@/types/categories";
import type { PageFormInput } from "@/types/pages";
import type { ProductFormInput } from "@/types/products";
import type { PublishValidationResult } from "@/types/publish-validation";
import type { SeoOwnerType } from "@/constants/seo";

export class PublishValidationError extends Error {
  readonly result: PublishValidationResult;

  constructor(result: PublishValidationResult) {
    super(formatPublishValidationError(result));
    this.name = "PublishValidationError";
    this.result = result;
  }
}

function assertPublishValidation(result: PublishValidationResult): void {
  if (!result.valid) {
    throw new PublishValidationError(result);
  }
}

async function validateOwnerPublishReadiness(
  ownerType: SeoOwnerType,
  ownerId: string,
  labels: { readonly uk: string; readonly en: string },
  options: { readonly requireCover?: boolean },
): Promise<PublishValidationResult> {
  await ensureOwnerSeoProfiles(ownerType, ownerId, labels);

  const issues: PublishValidationResult["issues"][number][] = [];

  if (!(await ownerSeoProfilesAreComplete(ownerType, ownerId))) {
    issues.push({
      field: "seoProfiles",
      message: "SEO profiles for Ukrainian and English are required to publish",
    });
  }

  if (options.requireCover && (ownerType === "product" || ownerType === "category")) {
    if (!(await ownerHasCover(ownerType, ownerId))) {
      issues.push({
        field: "cover",
        message: "Cover image is required to publish",
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

export async function assertProductCanPublish(
  productId: string,
  input: ProductFormInput,
): Promise<void> {
  const inputResult = validateProductPublishInput(input);

  if (input.status !== "published") {
    assertPublishValidation(inputResult);
    return;
  }

  const readinessResult = await validateOwnerPublishReadiness(
    "product",
    productId,
    {
      uk: input.translations.uk.name,
      en: input.translations.en.name,
    },
    { requireCover: false },
  );

  assertPublishValidation(mergePublishValidationResults(inputResult, readinessResult));
}

export async function assertCategoryCanPublish(
  categoryId: string,
  input: CategoryFormInput,
): Promise<void> {
  const inputResult = validateCategoryPublishInput(input);

  if (input.status !== "published") {
    assertPublishValidation(inputResult);
    return;
  }

  const readinessResult = await validateOwnerPublishReadiness(
    "category",
    categoryId,
    {
      uk: input.translations.uk.name,
      en: input.translations.en.name,
    },
    { requireCover: false },
  );

  assertPublishValidation(mergePublishValidationResults(inputResult, readinessResult));
}

export async function assertProductStatusCanPublish(
  productId: string,
  existing: ProductFormInput,
): Promise<void> {
  await assertProductCanPublish(productId, {
    ...existing,
    status: "published",
  });
}

export async function assertCategoryStatusCanPublish(
  categoryId: string,
  input: CategoryFormInput,
): Promise<void> {
  await assertCategoryCanPublish(categoryId, {
    ...input,
    status: "published",
  });
}

export async function provisionProductSeoProfiles(
  productId: string,
  labels: { readonly uk: string; readonly en: string },
): Promise<void> {
  await ensureOwnerSeoProfiles("product", productId, labels);
}

export async function provisionCategorySeoProfiles(
  categoryId: string,
  labels: { readonly uk: string; readonly en: string },
): Promise<void> {
  await ensureOwnerSeoProfiles("category", categoryId, labels);
}

export async function assertPageCanPublish(pageId: string, input: PageFormInput): Promise<void> {
  const inputResult = validatePagePublishInput(input);

  if (input.status !== "published") {
    assertPublishValidation(inputResult);
    return;
  }

  const readinessResult = await validateOwnerPublishReadiness(
    "page",
    pageId,
    {
      uk: input.translations.uk.title,
      en: input.translations.en.title,
    },
    { requireCover: false },
  );

  assertPublishValidation(mergePublishValidationResults(inputResult, readinessResult));
}

export async function assertPageStatusCanPublish(pageId: string, input: PageFormInput): Promise<void> {
  await assertPageCanPublish(pageId, {
    ...input,
    status: "published",
  });
}

export async function provisionPageSeoProfiles(
  pageId: string,
  labels: { readonly uk: string; readonly en: string },
): Promise<void> {
  await ensureOwnerSeoProfiles("page", pageId, labels);
}

export async function assertBrandCanPublish(brandId: string, input: BrandFormInput): Promise<void> {
  const inputResult = validateBrandPublishInput(input);

  if (input.status !== "published") {
    assertPublishValidation(inputResult);
    return;
  }

  const readinessResult = await validateOwnerPublishReadiness(
    "brand",
    brandId,
    {
      uk: input.translations.uk.name,
      en: input.translations.en.name,
    },
    { requireCover: false },
  );

  assertPublishValidation(mergePublishValidationResults(inputResult, readinessResult));
}

export async function assertBrandStatusCanPublish(
  brandId: string,
  input: BrandFormInput,
): Promise<void> {
  await assertBrandCanPublish(brandId, {
    ...input,
    status: "published",
  });
}

export async function provisionBrandSeoProfiles(
  brandId: string,
  labels: { readonly uk: string; readonly en: string },
): Promise<void> {
  await ensureOwnerSeoProfiles("brand", brandId, labels);
}
