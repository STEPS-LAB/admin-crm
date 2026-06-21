import type { BrandFormInput } from "@/types/brands";
import type { CategoryFormInput } from "@/types/categories";
import type { PageFormInput } from "@/types/pages";
import type { ProductFormInput } from "@/types/products";
import type { PublishValidationIssue, PublishValidationResult } from "@/types/publish-validation";

function buildResult(issues: PublishValidationIssue[]): PublishValidationResult {
  return {
    valid: issues.length === 0,
    issues,
  };
}

function validateTranslationNames(
  translations: { readonly uk: { readonly name: string }; readonly en: { readonly name: string } },
  entityLabel: string,
): PublishValidationIssue[] {
  const issues: PublishValidationIssue[] = [];

  if (!translations.uk.name.trim()) {
    issues.push({ field: "translations.uk.name", message: `${entityLabel} Ukrainian name is required to publish` });
  }

  if (!translations.en.name.trim()) {
    issues.push({ field: "translations.en.name", message: `${entityLabel} English name is required to publish` });
  }

  return issues;
}

export function validateProductPublishInput(input: ProductFormInput): PublishValidationResult {
  if (input.status !== "published") {
    return buildResult([]);
  }

  const issues: PublishValidationIssue[] = [
    ...validateTranslationNames(input.translations, "Product"),
  ];

  if (!input.translations.uk.description?.trim()) {
    issues.push({
      field: "translations.uk.description",
      message: "Product Ukrainian description is required to publish",
    });
  }

  if (!input.translations.en.description?.trim()) {
    issues.push({
      field: "translations.en.description",
      message: "Product English description is required to publish",
    });
  }

  if (!input.translations.uk.slug.trim()) {
    issues.push({ field: "translations.uk.slug", message: "Product Ukrainian slug is required to publish" });
  }

  if (!input.translations.en.slug.trim()) {
    issues.push({ field: "translations.en.slug", message: "Product English slug is required to publish" });
  }

  if (!input.sku.trim()) {
    issues.push({ field: "sku", message: "SKU is required to publish" });
  }

  if (!input.categoryId) {
    issues.push({ field: "categoryId", message: "Category is required to publish" });
  }

  const price = Number.parseFloat(input.price);

  if (!Number.isFinite(price) || price <= 0) {
    issues.push({ field: "price", message: "Price must be greater than zero to publish" });
  }

  return buildResult(issues);
}

export function validateCategoryPublishInput(input: CategoryFormInput): PublishValidationResult {
  if (input.status !== "published") {
    return buildResult([]);
  }

  const issues: PublishValidationIssue[] = [
    ...validateTranslationNames(input.translations, "Category"),
  ];

  if (!input.translations.uk.slug.trim()) {
    issues.push({ field: "translations.uk.slug", message: "Category Ukrainian slug is required to publish" });
  }

  if (!input.translations.en.slug.trim()) {
    issues.push({ field: "translations.en.slug", message: "Category English slug is required to publish" });
  }

  return buildResult(issues);
}

export function validatePagePublishInput(input: PageFormInput): PublishValidationResult {
  if (input.status !== "published") {
    return buildResult([]);
  }

  const issues: PublishValidationIssue[] = [];

  if (!input.translations.uk.title.trim()) {
    issues.push({
      field: "translations.uk.title",
      message: "Page Ukrainian title is required to publish",
    });
  }

  if (!input.translations.en.title.trim()) {
    issues.push({
      field: "translations.en.title",
      message: "Page English title is required to publish",
    });
  }

  if (!input.translations.uk.slug.trim()) {
    issues.push({ field: "translations.uk.slug", message: "Page Ukrainian slug is required to publish" });
  }

  if (!input.translations.en.slug.trim()) {
    issues.push({ field: "translations.en.slug", message: "Page English slug is required to publish" });
  }

  if (!input.translations.uk.content?.trim()) {
    issues.push({
      field: "translations.uk.content",
      message: "Page Ukrainian content is required to publish",
    });
  }

  if (!input.translations.en.content?.trim()) {
    issues.push({
      field: "translations.en.content",
      message: "Page English content is required to publish",
    });
  }

  return buildResult(issues);
}

export function validateBrandPublishInput(input: BrandFormInput): PublishValidationResult {
  if (input.status !== "published") {
    return buildResult([]);
  }

  const issues: PublishValidationIssue[] = [
    ...validateTranslationNames(input.translations, "Brand"),
  ];

  if (!input.slug.trim()) {
    issues.push({ field: "slug", message: "Brand slug is required to publish" });
  }

  return buildResult(issues);
}

export function mergePublishValidationResults(
  ...results: readonly PublishValidationResult[]
): PublishValidationResult {
  const issues = results.flatMap((result) => result.issues);

  return buildResult(issues);
}
