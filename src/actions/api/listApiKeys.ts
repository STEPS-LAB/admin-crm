"use server";

import { listApiKeys } from "@/services/apiService";

import type { ApiKeyListItem } from "@/types/api";

export async function listApiKeysAction(): Promise<ApiKeyListItem[]> {
  return listApiKeys();
}
