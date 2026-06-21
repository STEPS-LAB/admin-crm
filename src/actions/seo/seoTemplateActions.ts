"use server";

import { revalidatePath } from "next/cache";

import {
  applySeoTemplateToProfile,
  createSeoTemplate,
  deleteSeoTemplate,
  getSeoTemplate,
  listSeoTemplates,
  previewSeoTemplate,
  updateSeoTemplate,
} from "@/services/seoTemplateService";
import {
  applySeoTemplateSchema,
  seoTemplateFormSchema,
  seoTemplateIdSchema,
  seoTemplateListFiltersSchema,
  seoTemplatePreviewSchema,
} from "@/schemas/seo/seoTemplateSchemas";

import type { SeoTemplateDetail, SeoTemplateListItem, SeoTemplatePreviewResult } from "@/types/seo-templates";
import type { ServerActionResult } from "@/types";
import type { SeoTemplateMutationResult } from "@/services/seoTemplateService";

function revalidateTemplatePaths(id?: string): void {
  revalidatePath("/admin/seo/templates");
  revalidatePath("/admin/seo/profiles");

  if (id) {
    revalidatePath(`/admin/seo/templates/${id}`);
  }
}

export async function listSeoTemplatesAction(
  rawParams: Record<string, string | string[] | undefined> = {},
): Promise<SeoTemplateListItem[]> {
  const parsed = seoTemplateListFiltersSchema.safeParse({
    ownerType: typeof rawParams.ownerType === "string" ? rawParams.ownerType : undefined,
    language: typeof rawParams.language === "string" ? rawParams.language : undefined,
  });

  const filters = parsed.success ? parsed.data : {};

  return listSeoTemplates(filters);
}

export async function getSeoTemplateAction(id: string): Promise<SeoTemplateDetail | null> {
  const parsed = seoTemplateIdSchema.safeParse({ id });

  if (!parsed.success) {
    return null;
  }

  return getSeoTemplate(parsed.data.id);
}

export async function createSeoTemplateAction(
  _prevState: ServerActionResult<SeoTemplateMutationResult> | null,
  formData: FormData,
): Promise<ServerActionResult<SeoTemplateMutationResult>> {
  const parsed = seoTemplateFormSchema.safeParse({
    ownerType: formData.get("ownerType"),
    language: formData.get("language"),
    name: formData.get("name"),
    metaTitleTemplate: normalizeNullableField(formData.get("metaTitleTemplate")),
    metaDescriptionTemplate: normalizeNullableField(formData.get("metaDescriptionTemplate")),
    ogTitleTemplate: normalizeNullableField(formData.get("ogTitleTemplate")),
    ogDescriptionTemplate: normalizeNullableField(formData.get("ogDescriptionTemplate")),
    isDefault: formData.get("isDefault") === "true",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid template",
      code: "VALIDATION_ERROR",
    };
  }

  try {
    const result = await createSeoTemplate(parsed.data);
    revalidateTemplatePaths(result.id);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create template",
      code: "CREATE_FAILED",
    };
  }
}

export async function updateSeoTemplateAction(
  _prevState: ServerActionResult<SeoTemplateMutationResult> | null,
  formData: FormData,
): Promise<ServerActionResult<SeoTemplateMutationResult>> {
  const id = formData.get("id");

  if (typeof id !== "string") {
    return { success: false, error: "Template id is required", code: "VALIDATION_ERROR" };
  }

  const parsed = seoTemplateFormSchema.safeParse({
    ownerType: formData.get("ownerType"),
    language: formData.get("language"),
    name: formData.get("name"),
    metaTitleTemplate: normalizeNullableField(formData.get("metaTitleTemplate")),
    metaDescriptionTemplate: normalizeNullableField(formData.get("metaDescriptionTemplate")),
    ogTitleTemplate: normalizeNullableField(formData.get("ogTitleTemplate")),
    ogDescriptionTemplate: normalizeNullableField(formData.get("ogDescriptionTemplate")),
    isDefault: formData.get("isDefault") === "true",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid template",
      code: "VALIDATION_ERROR",
    };
  }

  try {
    const result = await updateSeoTemplate(id, parsed.data);
    revalidateTemplatePaths(id);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update template",
      code: "UPDATE_FAILED",
    };
  }
}

export async function deleteSeoTemplateAction(id: string): Promise<ServerActionResult<{ id: string }>> {
  const parsed = seoTemplateIdSchema.safeParse({ id });

  if (!parsed.success) {
    return { success: false, error: "Invalid template id", code: "VALIDATION_ERROR" };
  }

  try {
    await deleteSeoTemplate(parsed.data.id);
    revalidateTemplatePaths();
    return { success: true, data: { id: parsed.data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete template",
      code: "DELETE_FAILED",
    };
  }
}

export async function previewSeoTemplateAction(
  input: unknown,
): Promise<ServerActionResult<SeoTemplatePreviewResult>> {
  const parsed = seoTemplatePreviewSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid preview request", code: "VALIDATION_ERROR" };
  }

  try {
    const result = await previewSeoTemplate(parsed.data);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to preview template",
      code: "PREVIEW_FAILED",
    };
  }
}

export async function applySeoTemplateAction(
  input: unknown,
): Promise<ServerActionResult<SeoTemplatePreviewResult>> {
  const parsed = applySeoTemplateSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid apply request", code: "VALIDATION_ERROR" };
  }

  try {
    const result = await applySeoTemplateToProfile(parsed.data.seoProfileId, parsed.data.templateId);
    revalidatePath(`/admin/seo/profiles/${parsed.data.seoProfileId}`);
    revalidatePath("/admin/seo/profiles");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to apply template",
      code: "APPLY_FAILED",
    };
  }
}

function normalizeNullableField(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
