import { z } from "zod";

const optionalMultiline = z
  .string()
  .trim()
  .or(z.literal(""))
  .transform((value) => (value === "" ? null : value));

const optionalText = z
  .string()
  .trim()
  .or(z.literal(""))
  .transform((value) => (value === "" ? null : value));

export const robotsConfigSchema = z.object({
  userAgent: z.string().trim().min(1, "User-agent is required").max(120),
  allowRules: optionalMultiline.nullable(),
  disallowRules: optionalMultiline.nullable(),
  host: optionalText.nullable(),
  sitemapUrls: z.array(z.string().url("Each sitemap URL must be valid")),
  customDirectives: optionalMultiline.nullable(),
  isActive: z.coerce.boolean(),
});

export type RobotsConfigValues = z.infer<typeof robotsConfigSchema>;
