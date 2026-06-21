import { z } from "zod";

import { PLUGIN_TYPES } from "@/constants/plugins";

export const pluginListFiltersSchema = z.object({
  type: z.enum(PLUGIN_TYPES).optional(),
  status: z.enum(["enabled", "disabled"]).optional(),
  q: z.string().trim().max(120).optional(),
});

export const togglePluginSchema = z.object({
  slug: z.string().trim().min(2).max(80),
  enabled: z.coerce.boolean(),
});
