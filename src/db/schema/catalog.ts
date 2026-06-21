import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import {
  brandStatusEnum,
  categoryStatusEnum,
  languageEnum,
  productStatusEnum,
  stockStatusEnum,
} from "./enums";

export const brands = pgTable(
  "brands",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    logoUrl: text("logo_url"),
    website: text("website"),
    country: text("country"),
    status: brandStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("brands_slug_idx").on(table.slug),
    index("brands_status_idx").on(table.status),
    index("brands_created_at_idx").on(table.createdAt),
  ],
);

export const brandTranslations = pgTable(
  "brand_translations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade", onUpdate: "cascade" }),
    language: languageEnum("language").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("brand_translations_language_slug_idx").on(table.language, table.brandId),
    index("brand_translations_brand_id_idx").on(table.brandId),
    index("brand_translations_language_idx").on(table.language),
    index("brand_translations_name_idx").on(table.name),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentId: uuid("parent_id"),
    imageId: uuid("image_id"),
    sortOrder: integer("sort_order").notNull().default(0),
    status: categoryStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("categories_parent_id_idx").on(table.parentId),
    index("categories_status_idx").on(table.status),
    index("categories_sort_order_idx").on(table.sortOrder),
    index("categories_parent_id_sort_order_idx").on(table.parentId, table.sortOrder),
  ],
);

export const categoryTranslations = pgTable(
  "category_translations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade", onUpdate: "cascade" }),
    language: languageEnum("language").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("category_translations_language_slug_idx").on(table.language, table.slug),
    index("category_translations_category_id_idx").on(table.categoryId),
    index("category_translations_language_idx").on(table.language),
    index("category_translations_name_idx").on(table.name),
  ],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sku: text("sku").notNull().unique(),
    barcode: text("barcode"),
    brandId: uuid("brand_id").references(() => brands.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict", onUpdate: "cascade" }),
    status: productStatusEnum("status").notNull().default("draft"),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    oldPrice: numeric("old_price", { precision: 12, scale: 2 }),
    currency: text("currency").notNull().default("UAH"),
    stockQuantity: integer("stock_quantity").notNull().default(0),
    stockStatus: stockStatusEnum("stock_status").notNull().default("in_stock"),
    weight: numeric("weight"),
    length: numeric("length"),
    width: numeric("width"),
    height: numeric("height"),
    sortOrder: integer("sort_order").notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("products_sku_idx").on(table.sku),
    index("products_barcode_idx").on(table.barcode),
    index("products_category_id_idx").on(table.categoryId),
    index("products_brand_id_idx").on(table.brandId),
    index("products_status_idx").on(table.status),
    index("products_published_at_idx").on(table.publishedAt),
    index("products_created_at_idx").on(table.createdAt),
    index("products_updated_at_idx").on(table.updatedAt),
    index("products_price_idx").on(table.price),
    index("products_stock_quantity_idx").on(table.stockQuantity),
    index("products_category_id_status_idx").on(table.categoryId, table.status),
    index("products_status_created_at_idx").on(table.status, table.createdAt),
    index("products_status_published_at_idx").on(table.status, table.publishedAt),
    index("products_brand_id_status_idx").on(table.brandId, table.status),
    index("products_status_price_idx").on(table.status, table.price),
  ],
);

export const productTranslations = pgTable(
  "product_translations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade", onUpdate: "cascade" }),
    language: languageEnum("language").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    shortDescription: text("short_description"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("product_translations_language_slug_idx").on(table.language, table.slug),
    index("product_translations_product_id_idx").on(table.productId),
    index("product_translations_language_idx").on(table.language),
    index("product_translations_name_idx").on(table.name),
    index("product_translations_language_slug_composite_idx").on(table.language, table.slug),
  ],
);

export const productAttributeDefinitions = pgTable(
  "product_attribute_definitions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull().unique(),
    labelUk: text("label_uk").notNull(),
    labelEn: text("label_en").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isFilterable: boolean("is_filterable").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("product_attribute_definitions_key_idx").on(table.key),
    index("product_attribute_definitions_sort_order_idx").on(table.sortOrder),
  ],
);

export const productAttributeValues = pgTable(
  "product_attribute_values",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade", onUpdate: "cascade" }),
    definitionId: uuid("definition_id")
      .notNull()
      .references(() => productAttributeDefinitions.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    valueUk: text("value_uk"),
    valueEn: text("value_en"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("product_attribute_values_product_id_idx").on(table.productId),
    index("product_attribute_values_definition_id_idx").on(table.definitionId),
    uniqueIndex("product_attribute_values_product_definition_idx").on(
      table.productId,
      table.definitionId,
    ),
  ],
);
