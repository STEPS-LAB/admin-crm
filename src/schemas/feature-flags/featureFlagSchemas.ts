import { z } from "zod";

export const toggleFeatureFlagSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  enabled: z.boolean(),
});
