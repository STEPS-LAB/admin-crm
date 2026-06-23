"use server";

import { getAuthenticatedUser } from "@/lib/auth/cachedAuthenticatedUser";

import type { AuthUser } from "@/types/auth";

export async function getCurrentUserAction(): Promise<AuthUser | null> {
  return getAuthenticatedUser();
}
