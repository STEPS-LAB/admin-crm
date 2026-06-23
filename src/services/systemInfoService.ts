import { getSystemInfoSnapshot } from "@/lib/system/systemInfo";
import { getAuthenticatedUser } from "@/lib/auth/cachedAuthenticatedUser";

import type { AuthUser } from "@/types/auth";
import type { SystemInfoSnapshot } from "@/types/system-info";

async function requireAuthenticatedUser(): Promise<AuthUser> {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}

export async function getSystemInfo(): Promise<SystemInfoSnapshot> {
  await requireAuthenticatedUser();
  return getSystemInfoSnapshot();
}
