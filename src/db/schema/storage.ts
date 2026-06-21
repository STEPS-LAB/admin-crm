import {
  bigint,
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

import { mediaOwnerTypeEnum, mediaUsageTypeEnum } from "./enums";

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storageBucket: text("storage_bucket").notNull(),
    storagePath: text("storage_path").notNull().unique(),
    originalFilename: text("original_filename").notNull(),
    generatedFilename: text("generated_filename").notNull(),
    extension: text("extension").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSize: bigint("file_size", { mode: "number" }).notNull(),
    width: integer("width"),
    height: integer("height"),
    aspectRatio: numeric("aspect_ratio", { precision: 6, scale: 3 }),
    dominantColor: text("dominant_color"),
    blurhash: text("blurhash"),
    sha256Hash: text("sha256_hash").notNull().unique(),
    altUk: text("alt_uk"),
    altEn: text("alt_en"),
    titleUk: text("title_uk"),
    titleEn: text("title_en"),
    captionUk: text("caption_uk"),
    captionEn: text("caption_en"),
    copyright: text("copyright"),
    photographer: text("photographer"),
    license: text("license"),
    isPublic: boolean("is_public").notNull().default(true),
    isOptimized: boolean("is_optimized").notNull().default(false),
    hasWebp: boolean("has_webp").notNull().default(false),
    hasAvif: boolean("has_avif").notNull().default(false),
    hasThumbnail: boolean("has_thumbnail").notNull().default(false),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("media_assets_storage_bucket_idx").on(table.storageBucket),
    index("media_assets_storage_path_idx").on(table.storagePath),
    index("media_assets_sha256_hash_idx").on(table.sha256Hash),
    index("media_assets_mime_type_idx").on(table.mimeType),
    index("media_assets_extension_idx").on(table.extension),
    index("media_assets_is_deleted_idx").on(table.isDeleted),
    index("media_assets_created_at_idx").on(table.createdAt),
  ],
);

export const mediaUsage = pgTable(
  "media_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    mediaAssetId: uuid("media_asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade", onUpdate: "cascade" }),
    ownerType: mediaOwnerTypeEnum("owner_type").notNull(),
    ownerId: uuid("owner_id").notNull(),
    usageType: mediaUsageTypeEnum("usage_type").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("media_usage_media_asset_id_idx").on(table.mediaAssetId),
    index("media_usage_owner_type_idx").on(table.ownerType),
    index("media_usage_owner_id_idx").on(table.ownerId),
    index("media_usage_owner_type_owner_id_idx").on(table.ownerType, table.ownerId),
    index("media_usage_usage_type_idx").on(table.usageType),
  ],
);

export const mediaCollections = pgTable(
  "media_collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("media_collections_slug_idx").on(table.slug),
    index("media_collections_name_idx").on(table.name),
  ],
);

export const mediaCollectionItems = pgTable(
  "media_collection_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => mediaCollections.id, { onDelete: "cascade", onUpdate: "cascade" }),
    mediaAssetId: uuid("media_asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade", onUpdate: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("media_collection_items_collection_asset_idx").on(
      table.collectionId,
      table.mediaAssetId,
    ),
    index("media_collection_items_collection_id_idx").on(table.collectionId),
    index("media_collection_items_media_asset_id_idx").on(table.mediaAssetId),
  ],
);
