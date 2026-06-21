import { boolean, index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { languageEnum, pageStatusEnum, pageTypeEnum } from "./enums";

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pageType: pageTypeEnum("page_type").notNull().default("static"),
    status: pageStatusEnum("status").notNull().default("draft"),
    isHomepage: boolean("is_homepage").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("pages_page_type_idx").on(table.pageType),
    index("pages_status_idx").on(table.status),
    index("pages_is_homepage_idx").on(table.isHomepage),
    index("pages_published_at_idx").on(table.publishedAt),
    index("pages_created_at_idx").on(table.createdAt),
    index("pages_status_created_at_idx").on(table.status, table.createdAt),
  ],
);

export const pageTranslations = pgTable(
  "page_translations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade", onUpdate: "cascade" }),
    language: languageEnum("language").notNull(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    content: text("content"),
    excerpt: text("excerpt"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("page_translations_language_slug_idx").on(table.language, table.slug),
    index("page_translations_page_id_idx").on(table.pageId),
    index("page_translations_language_idx").on(table.language),
    index("page_translations_title_idx").on(table.title),
  ],
);
