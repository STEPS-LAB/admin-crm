"use server";

import { getAuthenticatedUser } from "@/lib/auth/cachedAuthenticatedUser";
import { enforceServerActionRateLimit } from "@/lib/security/serverActionRateLimit";

export async function enforceListSearchRateLimit(search: string | undefined | null): Promise<void> {
  if (!search?.trim()) {
    return;
  }

  const user = await getAuthenticatedUser();
  await enforceServerActionRateLimit("search", user?.id ?? null);
}

export async function enforceExportRateLimit(): Promise<void> {
  const user = await getAuthenticatedUser();
  await enforceServerActionRateLimit("export", user?.id ?? null);
}

export async function enforceImportRateLimit(): Promise<void> {
  const user = await getAuthenticatedUser();
  await enforceServerActionRateLimit("import", user?.id ?? null);
}
