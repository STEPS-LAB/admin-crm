import { z } from "zod";

import { PREPARED_WEBHOOK_EVENTS } from "@/constants/api";
import { WEBHOOK_RETRY_LIMITS } from "@/constants/security-settings";

const webhookEventSchema = z.enum(PREPARED_WEBHOOK_EVENTS);

export const createWebhookEndpointSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or fewer"),
  url: z.string().trim().url("Endpoint URL must be valid").max(2048),
  events: z
    .array(webhookEventSchema)
    .min(1, "Select at least one event")
    .max(PREPARED_WEBHOOK_EVENTS.length),
  description: z
    .string()
    .trim()
    .max(240, "Description must be 240 characters or fewer")
    .optional()
    .nullable(),
});

export const updateWebhookEndpointSchema = z.object({
  id: z.string().uuid("Invalid webhook endpoint"),
  name: z.string().trim().min(2).max(80).optional(),
  url: z.string().trim().url().max(2048).optional(),
  events: z.array(webhookEventSchema).min(1).max(PREPARED_WEBHOOK_EVENTS.length).optional(),
  description: z.string().trim().max(240).nullable().optional(),
  status: z.enum(["active", "disabled"]).optional(),
});

export const webhookEndpointIdSchema = z.object({
  id: z.string().uuid("Invalid webhook endpoint"),
});

export const webhookRetrySettingsSchema = z.object({
  webhookMaxRetries: z.coerce
    .number()
    .int()
    .min(WEBHOOK_RETRY_LIMITS.maxRetriesMin)
    .max(WEBHOOK_RETRY_LIMITS.maxRetriesMax),
  webhookRetryBaseDelaySeconds: z.coerce
    .number()
    .int()
    .min(WEBHOOK_RETRY_LIMITS.baseDelayMinSeconds)
    .max(WEBHOOK_RETRY_LIMITS.baseDelayMaxSeconds),
});

export type CreateWebhookEndpointFormValues = z.infer<typeof createWebhookEndpointSchema>;
