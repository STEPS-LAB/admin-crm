import type { SeoTemplateLanguage, SeoTemplateOwnerType } from "@/constants/seo-templates";
import type { SeoOwnerType } from "@/constants/seo";

export interface SeoTemplateListItem {
  readonly id: string;
  readonly ownerType: SeoTemplateOwnerType;
  readonly language: SeoTemplateLanguage;
  readonly name: string;
  readonly isDefault: boolean;
  readonly updatedAt: Date;
}

export interface SeoTemplateDetail {
  readonly id: string;
  readonly ownerType: SeoTemplateOwnerType;
  readonly language: SeoTemplateLanguage;
  readonly name: string;
  readonly metaTitleTemplate: string | null;
  readonly metaDescriptionTemplate: string | null;
  readonly ogTitleTemplate: string | null;
  readonly ogDescriptionTemplate: string | null;
  readonly isDefault: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface SeoTemplateFormInput {
  readonly ownerType: SeoTemplateOwnerType;
  readonly language: SeoTemplateLanguage;
  readonly name: string;
  readonly metaTitleTemplate: string | null;
  readonly metaDescriptionTemplate: string | null;
  readonly ogTitleTemplate: string | null;
  readonly ogDescriptionTemplate: string | null;
  readonly isDefault: boolean;
}

export interface SeoTemplateListFilters {
  readonly ownerType?: SeoTemplateOwnerType | undefined;
  readonly language?: SeoTemplateLanguage | undefined;
}

export interface SeoTemplatePreviewInput {
  readonly ownerType: SeoTemplateOwnerType;
  readonly language: SeoTemplateLanguage;
  readonly metaTitleTemplate: string | null;
  readonly metaDescriptionTemplate: string | null;
  readonly ogTitleTemplate: string | null;
  readonly ogDescriptionTemplate: string | null;
  readonly seoProfileId?: string | undefined;
}

export interface SeoTemplatePreviewResult {
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly ogTitle: string;
  readonly ogDescription: string;
}

export interface SeoTemplateAppliedMetadata {
  readonly metaTitle: string | null;
  readonly metaDescription: string | null;
  readonly ogTitle: string | null;
  readonly ogDescription: string | null;
}

export interface InternalLinkListItem {
  readonly id: string;
  readonly seoProfileId: string;
  readonly sourceLabel: string;
  readonly sourceOwnerType: SeoOwnerType;
  readonly sourceLanguage: "uk" | "en";
  readonly targetOwnerType: SeoOwnerType;
  readonly targetOwnerId: string;
  readonly targetLabel: string;
  readonly anchorText: string | null;
  readonly sortOrder: number;
  readonly isAutomatic: boolean;
  readonly updatedAt: Date;
  readonly targetHref: string | null;
  readonly sourceHref: string | null;
}

export interface InternalLinkFormInput {
  readonly seoProfileId: string;
  readonly targetOwnerType: SeoOwnerType;
  readonly targetOwnerId: string;
  readonly anchorText: string | null;
}

export interface InternalLinkTargetOption {
  readonly ownerType: SeoOwnerType;
  readonly ownerId: string;
  readonly label: string;
  readonly secondaryLabel: string | null;
}
