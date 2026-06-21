import { boolean, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { auditActionEnum } from "./enums";

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey(),
    email: text("email").notNull().unique(),
    displayName: text("display_name").notNull(),
    avatarUrl: text("avatar_url"),
    locale: text("locale").notNull().default("uk"),
    timezone: text("timezone").notNull().default("Europe/Kyiv"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [
    index("profiles_email_idx").on(table.email),
    index("profiles_display_name_idx").on(table.displayName),
    index("profiles_is_active_idx").on(table.isActive),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id").references(() => profiles.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    action: auditActionEnum("action").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_profile_id_idx").on(table.profileId),
    index("audit_logs_action_idx").on(table.action),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade", onUpdate: "cascade" }),
    deviceName: text("device_name"),
    browser: text("browser"),
    operatingSystem: text("operating_system"),
    country: text("country"),
    city: text("city"),
    lastActivity: timestamp("last_activity", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("sessions_profile_id_idx").on(table.profileId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ],
);
