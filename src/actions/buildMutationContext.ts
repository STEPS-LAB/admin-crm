"use server";

import { headers } from "next/headers";

import { extractRequestMetadata } from "@/lib/security/requestMetadata";
import { getAuthenticatedUser } from "@/lib/auth/cachedAuthenticatedUser";

import type { HistoryMutationContext } from "@/services/historyService";

export async function buildMutationContext(): Promise<HistoryMutationContext> {
  const [user, headerStore] = await Promise.all([getAuthenticatedUser(), headers()]);

  return {
    profileId: user?.id ?? null,
    metadata: extractRequestMetadata(headerStore),
  };
}
