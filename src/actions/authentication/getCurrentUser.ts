"use server";

import { getAuthenticatedUser } from "@/services/authenticationService";

import type { AuthUser } from "@/types/auth";

export async function getCurrentUserAction(): Promise<AuthUser | null> {
  return getAuthenticatedUser();
}
