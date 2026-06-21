import { PUBLISH_WARNING_LOW_SEO_SCORE_THRESHOLD } from "@/constants/publish";
import {
  validateBrandPublishInput,
  validateCategoryPublishInput,
  validatePagePublishInput,
  validateProductPublishInput,
} from "@/lib/catalog/publishValidation";

import type { BrandFormInput } from "@/types/brands";
import type { CategoryFormInput } from "@/types/categories";
import type { PageFormInput } from "@/types/pages";
import type { EntityMediaCollection, EntityMediaItem } from "@/types/entity-media";
import type { ProductFormInput } from "@/types/products";
import type { PublishValidationIssue, PublishWarning } from "@/types/publish-validation";

export interface PublishReadinessContext {
  readonly media: EntityMediaCollection | null;
  readonly seoScore: number | null;
}

function addWarning(
  warnings: PublishWarning[],
  id: string,
  field: string,
  message: string,
): void {
  if (!warnings.some((warning) => warning.id === id)) {
    warnings.push({ id, field, message });
  }
}

function collectMediaAltWarnings(
  media: EntityMediaCollection,
  warnings: PublishWarning[],
): void {
  const items: EntityMediaItem[] = [
    ...(media.cover ? [media.cover] : []),
    ...media.gallery,
  ];

  for (const item of items) {
    if (!item.altUk?.trim()) {
      addWarning(
        warnings,
        `alt-uk-${item.usageId}`,
        "media",
        `Missing Ukrainian ALT text for ${item.originalFilename}`,
      );
    }

    if (!item.altEn?.trim()) {
      addWarning(
        warnings,
        `alt-en-${item.usageId}`,
        "media",
        `Missing English ALT text for ${item.originalFilename}`,
      );
    }
  }
}

function collectLowSeoScoreWarning(
  seoScore: number | null,
  warnings: PublishWarning[],
): void {
  if (seoScore === null) {
    addWarning(
      warnings,
      "seo-score-missing",
      "seo",
      "SEO score is not available yet — run an SEO scan after saving",
    );
    return;
  }

  if (seoScore < PUBLISH_WARNING_LOW_SEO_SCORE_THRESHOLD) {
    addWarning(
      warnings,
      "seo-score-low",
      "seo",
      `SEO score is ${seoScore} — consider improving metadata before publishing`,
    );
  }
}

export function collectProductPublishWarnings(
  input: ProductFormInput,
  context: PublishReadinessContext,
): PublishWarning[] {
  if (input.status !== "published") {
    return [];
  }

  const warnings: PublishWarning[] = [];

  if (!context.media?.cover) {
    addWarning(warnings, "cover-missing", "cover", "No cover image — storefront previews may look incomplete");
  } else {
    collectMediaAltWarnings(context.media, warnings);
  }

  if (!input.translations.uk.shortDescription?.trim()) {
    addWarning(
      warnings,
      "short-description-uk",
      "translations.uk.shortDescription",
      "Ukrainian short description is empty",
    );
  }

  if (!input.translations.en.shortDescription?.trim()) {
    addWarning(
      warnings,
      "short-description-en",
      "translations.en.shortDescription",
      "English short description is empty",
    );
  }

  collectLowSeoScoreWarning(context.seoScore, warnings);

  return warnings;
}

export function collectCategoryPublishWarnings(
  input: CategoryFormInput,
  context: PublishReadinessContext,
): PublishWarning[] {
  if (input.status !== "published") {
    return [];
  }

  const warnings: PublishWarning[] = [];

  if (!context.media?.cover) {
    addWarning(warnings, "cover-missing", "cover", "No cover image — navigation and category pages may look incomplete");
  } else {
    collectMediaAltWarnings(context.media, warnings);
  }

  if (!input.translations.uk.description?.trim()) {
    addWarning(
      warnings,
      "description-uk",
      "translations.uk.description",
      "Ukrainian description is empty",
    );
  }

  if (!input.translations.en.description?.trim()) {
    addWarning(
      warnings,
      "description-en",
      "translations.en.description",
      "English description is empty",
    );
  }

  collectLowSeoScoreWarning(context.seoScore, warnings);

  return warnings;
}

export function collectProductPublishBlockingIssues(
  input: ProductFormInput,
): readonly PublishValidationIssue[] {
  return validateProductPublishInput(input).issues;
}

export function collectCategoryPublishBlockingIssues(
  input: CategoryFormInput,
): readonly PublishValidationIssue[] {
  return validateCategoryPublishInput(input).issues;
}

export function collectPagePublishBlockingIssues(
  input: PageFormInput,
): readonly PublishValidationIssue[] {
  return validatePagePublishInput(input).issues;
}

export function collectBrandPublishBlockingIssues(
  input: BrandFormInput,
): readonly PublishValidationIssue[] {
  return validateBrandPublishInput(input).issues;
}

export function collectPagePublishWarnings(
  input: PageFormInput,
  context: PublishReadinessContext,
): PublishWarning[] {
  if (input.status !== "published") {
    return [];
  }

  const warnings: PublishWarning[] = [];

  if (!context.media?.cover) {
    addWarning(warnings, "cover-missing", "cover", "No featured image — page previews may look incomplete");
  } else {
    collectMediaAltWarnings(context.media, warnings);
  }

  collectLowSeoScoreWarning(context.seoScore, warnings);

  return warnings;
}

export function collectBrandPublishWarnings(
  input: BrandFormInput,
  context: PublishReadinessContext,
): PublishWarning[] {
  if (input.status !== "published") {
    return [];
  }

  const warnings: PublishWarning[] = [];

  if (!context.media?.cover && !input.logoUrl?.trim()) {
    addWarning(warnings, "logo-missing", "cover", "No logo image — brand listings may look incomplete");
  } else if (context.media?.cover) {
    collectMediaAltWarnings(context.media, warnings);
  }

  if (!input.translations.uk.description?.trim()) {
    addWarning(warnings, "description-uk", "translations.uk.description", "Ukrainian description is empty");
  }

  if (!input.translations.en.description?.trim()) {
    addWarning(warnings, "description-en", "translations.en.description", "English description is empty");
  }

  collectLowSeoScoreWarning(context.seoScore, warnings);

  return warnings;
}
