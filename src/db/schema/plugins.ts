import { boolean, index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const pluginInstallations = pgTable(
  "plugin_installations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    enabled: boolean("enabled").notNull().default(true),
    config: jsonb("config"),
    installedAt: timestamp("installed_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("plugin_installations_slug_idx").on(table.slug),
    index("plugin_installations_enabled_idx").on(table.enabled),
    index("plugin_installations_installed_at_idx").on(table.installedAt),
  ],
);
