import { boolean, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const featureFlagInstallations = pgTable(
  "feature_flag_installations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    enabled: boolean("enabled").notNull().default(false),
    installedAt: timestamp("installed_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("feature_flag_installations_slug_idx").on(table.slug),
    index("feature_flag_installations_enabled_idx").on(table.enabled),
    index("feature_flag_installations_installed_at_idx").on(table.installedAt),
  ],
);
