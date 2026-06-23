"use server";

import { z } from "zod";

import { getAuthenticatedUser } from "@/services/authenticationService";
import { updateUserLocale } from "@/services/userProfileService";
import { ADMIN_LOCALES } from "@/types/admin-locale";

import type { ServerActionResult } from "@/types";
import type { AuthUser } from "@/types/auth";

const updateLocaleSchema = z.object({
  locale: z.enum(ADMIN_LOCALES),
});

export async function updateAdminLocaleAction(
  locale: string,
): Promise<ServerActionResult<AuthUser>> {
  const parsed = updateLocaleSchema.safeParse({ locale });

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid locale",
      code: "VALIDATION_ERROR",
    };
  }

  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      error: "You must be signed in to change language.",
      code: "UNAUTHORIZED",
    };
  }

  try {
    const updated = await updateUserLocale(user.id, parsed.data.locale);
    return { success: true, data: updated };
  } catch {
    return {
      success: false,
      error: "Failed to update language preference.",
      code: "INTERNAL_ERROR",
    };
  }
}
