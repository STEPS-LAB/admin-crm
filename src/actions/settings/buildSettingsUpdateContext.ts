"use server";

import { buildMutationContext } from "@/actions/buildMutationContext";
import { enforceServerActionRateLimit } from "@/lib/security/serverActionRateLimit";

import type { SettingsUpdateContext } from "@/services/settingsService";

export async function buildSettingsUpdateContext(): Promise<SettingsUpdateContext> {
  const context = await buildMutationContext();
  await enforceServerActionRateLimit("settings", context.profileId);
  return context;
}
