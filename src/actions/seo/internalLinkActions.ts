"use server";

import { revalidatePath } from "next/cache";

import {
  createInternalLink,
  deleteInternalLink,
  listAllManualInternalLinks,
  listInternalLinksByProfile,
  searchInternalLinkTargets,
} from "@/services/internalLinkService";
import {
  internalLinkFormSchema,
  internalLinkIdSchema,
  internalLinkProfileIdSchema,
  internalLinkTargetSearchSchema,
} from "@/schemas/seo/internalLinkSchemas";

import type { InternalLinkListItem, InternalLinkTargetOption } from "@/types/seo-templates";
import type { ServerActionResult } from "@/types";
import type { InternalLinkMutationResult } from "@/services/internalLinkService";

export async function listInternalLinksByProfileAction(
  seoProfileId: string,
): Promise<InternalLinkListItem[]> {
  const parsed = internalLinkProfileIdSchema.safeParse({ seoProfileId });

  if (!parsed.success) {
    return [];
  }

  return listInternalLinksByProfile(parsed.data.seoProfileId);
}

export async function listAllInternalLinksAction(): Promise<InternalLinkListItem[]> {
  return listAllManualInternalLinks();
}

export async function searchInternalLinkTargetsAction(
  search: string,
): Promise<InternalLinkTargetOption[]> {
  const parsed = internalLinkTargetSearchSchema.safeParse({ q: search });

  if (!parsed.success) {
    return [];
  }

  return searchInternalLinkTargets(parsed.data.q);
}

export async function createInternalLinkAction(
  input: unknown,
): Promise<ServerActionResult<InternalLinkMutationResult>> {
  const parsed = internalLinkFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid internal link",
      code: "VALIDATION_ERROR",
    };
  }

  try {
    const result = await createInternalLink(parsed.data);
    revalidatePath(`/admin/seo/profiles/${parsed.data.seoProfileId}`);
    revalidatePath("/admin/seo/internal-links");
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create internal link",
      code: "CREATE_FAILED",
    };
  }
}

export async function deleteInternalLinkAction(
  id: string,
): Promise<ServerActionResult<{ id: string }>> {
  const parsed = internalLinkIdSchema.safeParse({ id });

  if (!parsed.success) {
    return { success: false, error: "Invalid link id", code: "VALIDATION_ERROR" };
  }

  try {
    await deleteInternalLink(parsed.data.id);
    revalidatePath("/admin/seo/profiles");
    revalidatePath("/admin/seo/internal-links");
    return { success: true, data: { id: parsed.data.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete internal link",
      code: "DELETE_FAILED",
    };
  }
}
