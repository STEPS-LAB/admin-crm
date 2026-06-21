import {
  buildSampleSeoTemplateContext,
  buildSeoTemplateContextForProfile,
} from "@/lib/seo/templateContext";
import { renderSeoTemplate } from "@/lib/seo/templateEngine";
import {
  deleteSeoTemplateById,
  findDefaultSeoTemplate,
  findSeoTemplateById,
  findSeoTemplates,
  insertSeoTemplate,
  updateSeoTemplateRecord,
} from "@/repositories/seoTemplateRepository";
import {
  applyTemplateMetadataToProfile,
  findSeoProfileById,
} from "@/repositories/seoProfileRepository";

import type {
  SeoTemplateDetail,
  SeoTemplateFormInput,
  SeoTemplateListFilters,
  SeoTemplateListItem,
  SeoTemplatePreviewInput,
  SeoTemplatePreviewResult,
} from "@/types/seo-templates";

export interface SeoTemplateMutationResult {
  readonly id: string;
}

function renderTemplateFields(
  input: Pick<
    SeoTemplatePreviewInput,
    | "metaTitleTemplate"
    | "metaDescriptionTemplate"
    | "ogTitleTemplate"
    | "ogDescriptionTemplate"
  >,
  context: Awaited<ReturnType<typeof buildSeoTemplateContextForProfile>>,
): SeoTemplatePreviewResult {
  const safeContext = context ?? {};

  return {
    metaTitle: renderSeoTemplate(input.metaTitleTemplate, safeContext),
    metaDescription: renderSeoTemplate(input.metaDescriptionTemplate, safeContext),
    ogTitle: renderSeoTemplate(input.ogTitleTemplate, safeContext),
    ogDescription: renderSeoTemplate(input.ogDescriptionTemplate, safeContext),
  };
}

export async function listSeoTemplates(
  filters: SeoTemplateListFilters = {},
): Promise<SeoTemplateListItem[]> {
  return findSeoTemplates(filters);
}

export async function getSeoTemplate(id: string): Promise<SeoTemplateDetail | null> {
  return findSeoTemplateById(id);
}

export async function createSeoTemplate(
  input: SeoTemplateFormInput,
): Promise<SeoTemplateMutationResult> {
  const id = await insertSeoTemplate(input);
  return { id };
}

export async function updateSeoTemplate(
  id: string,
  input: SeoTemplateFormInput,
): Promise<SeoTemplateMutationResult> {
  const existing = await findSeoTemplateById(id);

  if (!existing) {
    throw new Error("SEO template not found");
  }

  await updateSeoTemplateRecord(id, input);
  return { id };
}

export async function deleteSeoTemplate(id: string): Promise<void> {
  const deleted = await deleteSeoTemplateById(id);

  if (!deleted) {
    throw new Error("SEO template not found");
  }
}

export async function previewSeoTemplate(
  input: SeoTemplatePreviewInput,
): Promise<SeoTemplatePreviewResult> {
  const context = input.seoProfileId
    ? await buildSeoTemplateContextForProfile(input.seoProfileId)
    : buildSampleSeoTemplateContext(input.ownerType, input.language);

  return renderTemplateFields(input, context);
}

export async function applySeoTemplateToProfile(
  seoProfileId: string,
  templateId: string,
): Promise<SeoTemplatePreviewResult> {
  const [profile, template] = await Promise.all([
    findSeoProfileById(seoProfileId),
    findSeoTemplateById(templateId),
  ]);

  if (!profile) {
    throw new Error("SEO profile not found");
  }

  if (!template) {
    throw new Error("SEO template not found");
  }

  const context = await buildSeoTemplateContextForProfile(seoProfileId);
  const rendered = renderTemplateFields(template, context);

  await applyTemplateMetadataToProfile(seoProfileId, {
    metaTitle: rendered.metaTitle || null,
    metaDescription: rendered.metaDescription || null,
    ogTitle: rendered.ogTitle || null,
    ogDescription: rendered.ogDescription || null,
  });

  return rendered;
}

export async function getDefaultSeoTemplateForProfile(
  seoProfileId: string,
): Promise<SeoTemplateDetail | null> {
  const profile = await findSeoProfileById(seoProfileId);

  if (!profile) {
    return null;
  }

  const ownerType =
    profile.ownerType === "product" ||
    profile.ownerType === "category" ||
    profile.ownerType === "page" ||
    profile.ownerType === "brand"
      ? profile.ownerType
      : "global";

  return findDefaultSeoTemplate(ownerType, profile.language);
}
