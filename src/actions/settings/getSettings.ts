"use server";

import { getSettings } from "@/services/settingsService";

import type { SettingsRecord } from "@/types/settings";

export async function getSettingsAction(): Promise<SettingsRecord> {
  return getSettings();
}
