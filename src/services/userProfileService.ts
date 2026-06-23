import { normalizeAdminLocale } from "@/constants/admin-locale";
import { updateProfileLocale } from "@/repositories/profileRepository";

import type { AuthUser } from "@/types/auth";
import type { AdminLocale } from "@/types/admin-locale";

export async function updateUserLocale(profileId: string, locale: AdminLocale): Promise<AuthUser> {
  const normalizedLocale = normalizeAdminLocale(locale);
  const updated = await updateProfileLocale(profileId, normalizedLocale);

  if (!updated) {
    throw new Error("Failed to update user locale");
  }

  return updated;
}
