#!/usr/bin/env tsx
/**
 * Applies updated_at triggers to all mutable tables after migrations.
 * Run after `pnpm db:migrate` against Supabase.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });
config();

const TABLES_WITH_UPDATED_AT = [
  "profiles",
  "brands",
  "brand_translations",
  "categories",
  "category_translations",
  "products",
  "product_translations",
  "product_attribute_definitions",
  "product_attribute_values",
  "seo_profiles",
  "metadata",
  "canonical",
  "robots",
  "open_graph",
  "twitter_cards",
  "schema_documents",
  "redirect_rules",
  "hreflang",
  "verification_codes",
  "custom_head_tags",
  "seo_templates",
  "seo_analysis",
  "internal_links",
  "sitemap_config",
  "robots_config",
  "settings",
  "media_assets",
  "media_collections",
  "pages",
  "page_translations",
  "notification_settings",
  "backup_records",
];

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const sql = postgres(databaseUrl, { max: 1 });
  const triggerSql = readFileSync(
    join(process.cwd(), "drizzle/triggers/updated_at.sql"),
    "utf8",
  );

  await sql.unsafe(triggerSql);

  for (const table of TABLES_WITH_UPDATED_AT) {
    const triggerName = `set_${table}_updated_at`;

    await sql.unsafe(`
      DROP TRIGGER IF EXISTS ${triggerName} ON ${table};
      CREATE TRIGGER ${triggerName}
      BEFORE UPDATE ON ${table}
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  await sql.end();
  process.stdout.write("updated_at triggers applied\n");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
