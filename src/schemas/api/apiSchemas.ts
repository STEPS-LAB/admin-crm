import { z } from "zod";

import { API_SCOPES } from "@/constants/api";

export const createApiKeySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or fewer"),
  scopes: z
    .array(z.enum(API_SCOPES))
    .min(1, "Select at least one scope")
    .max(API_SCOPES.length),
  expiresAt: z.coerce.date().optional().nullable(),
});

export type CreateApiKeyFormValues = z.infer<typeof createApiKeySchema>;

export const revokeApiKeySchema = z.object({
  id: z.string().uuid("Invalid API key"),
});
