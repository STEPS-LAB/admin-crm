import { index, jsonb, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { profiles } from "./auth";
import { apiKeyStatusEnum, webhookDeliveryStatusEnum, webhookEndpointStatusEnum } from "./enums";

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade", onUpdate: "cascade" }),
    name: text("name").notNull(),
    keyPrefix: text("key_prefix").notNull(),
    keyHash: text("key_hash").notNull(),
    scopes: text("scopes").array().notNull().default([]),
    status: apiKeyStatusEnum("status").notNull().default("active"),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("api_keys_profile_id_idx").on(table.profileId),
    index("api_keys_status_idx").on(table.status),
    index("api_keys_key_hash_idx").on(table.keyHash),
    index("api_keys_created_at_idx").on(table.createdAt),
  ],
);

export const webhookEndpoints = pgTable(
  "webhook_endpoints",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade", onUpdate: "cascade" }),
    name: text("name").notNull(),
    url: text("url").notNull(),
    secretPrefix: text("secret_prefix").notNull(),
    secretCiphertext: text("secret_ciphertext").notNull(),
    events: text("events").array().notNull().default([]),
    status: webhookEndpointStatusEnum("status").notNull().default("active"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("webhook_endpoints_profile_id_idx").on(table.profileId),
    index("webhook_endpoints_status_idx").on(table.status),
    index("webhook_endpoints_created_at_idx").on(table.createdAt),
  ],
);

export const webhookDeliveries = pgTable(
  "webhook_deliveries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    endpointId: uuid("endpoint_id")
      .notNull()
      .references(() => webhookEndpoints.id, { onDelete: "cascade", onUpdate: "cascade" }),
    event: text("event").notNull(),
    payload: jsonb("payload").notNull(),
    status: webhookDeliveryStatusEnum("status").notNull().default("pending"),
    attemptCount: integer("attempt_count").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(5),
    nextRetryAt: timestamp("next_retry_at", { withTimezone: true }),
    lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }),
    responseStatus: integer("response_status"),
    responseBody: text("response_body"),
    errorMessage: text("error_message"),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("webhook_deliveries_endpoint_id_idx").on(table.endpointId),
    index("webhook_deliveries_status_idx").on(table.status),
    index("webhook_deliveries_next_retry_at_idx").on(table.nextRetryAt),
    index("webhook_deliveries_created_at_idx").on(table.createdAt),
  ],
);
