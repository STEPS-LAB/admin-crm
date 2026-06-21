"use server";

import { enforceListSearchRateLimit } from "@/actions/guards/listActionGuards";
import { listPlugins } from "@/services/pluginService";
import { pluginListFiltersSchema } from "@/schemas/plugins/pluginSchemas";

import type { PluginListItem } from "@/types/plugins";

export async function listPluginsAction(
  rawParams: Record<string, string | string[] | undefined> = {},
): Promise<PluginListItem[]> {
  const parsed = pluginListFiltersSchema.safeParse({
    type: typeof rawParams.type === "string" ? rawParams.type : undefined,
    status: typeof rawParams.status === "string" ? rawParams.status : undefined,
    q: typeof rawParams.q === "string" ? rawParams.q : undefined,
  });

  const filters = parsed.success ? parsed.data : pluginListFiltersSchema.parse({});

  await enforceListSearchRateLimit(filters.q);

  return listPlugins({
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.q ? { search: filters.q } : {}),
  });
}
