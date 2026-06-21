import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import {
  changeFrequencyEnum,
  customHeadTagTypeEnum,
  languageEnum,
  redirectStatusCodeEnum,
  schemaTypeEnum,
  seoOwnerTypeEnum,
  seoTemplateOwnerTypeEnum,
} from "./enums";

export const seoProfiles = pgTable(
  "seo_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerType: seoOwnerTypeEnum("owner_type").notNull(),
    ownerId: uuid("owner_id").notNull(),
    language: languageEnum("language").notNull(),
    isIndexable: boolean("is_indexable").notNull().default(true),
    priority: numeric("priority", { precision: 2, scale: 1 }).notNull().default("0.5"),
    changeFrequency: changeFrequencyEnum("change_frequency").notNull().default("weekly"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("seo_profiles_owner_type_owner_id_language_idx").on(
      table.ownerType,
      table.ownerId,
      table.language,
    ),
    index("seo_profiles_owner_type_idx").on(table.ownerType),
    index("seo_profiles_owner_id_idx").on(table.ownerId),
    index("seo_profiles_language_idx").on(table.language),
    index("seo_profiles_is_indexable_idx").on(table.isIndexable),
    index("seo_profiles_owner_type_owner_id_language_composite_idx").on(
      table.ownerType,
      table.ownerId,
      table.language,
    ),
  ],
);

export const metadata = pgTable(
  "metadata",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    seoProfileId: uuid("seo_profile_id")
      .notNull()
      .unique()
      .references(() => seoProfiles.id, { onDelete: "cascade", onUpdate: "cascade" }),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    metaKeywords: text("meta_keywords"),
    metaAuthor: text("meta_author"),
    metaGenerator: text("meta_generator"),
    applicationName: text("application_name"),
    themeColor: text("theme_color"),
    viewport: text("viewport"),
    referrer: text("referrer"),
    creator: text("creator"),
    publisher: text("publisher"),
    copyright: text("copyright"),
    rating: text("rating"),
    distribution: text("distribution"),
    revisitAfter: text("revisit_after"),
    subject: text("subject"),
    abstract: text("abstract"),
    newsKeywords: text("news_keywords"),
    category: text("category"),
    classification: text("classification"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("metadata_seo_profile_id_idx").on(table.seoProfileId)],
);

export const canonical = pgTable(
  "canonical",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    seoProfileId: uuid("seo_profile_id")
      .notNull()
      .unique()
      .references(() => seoProfiles.id, { onDelete: "cascade", onUpdate: "cascade" }),
    canonicalUrl: text("canonical_url"),
    autoGenerate: boolean("auto_generate").notNull().default(true),
    forceHttps: boolean("force_https").notNull().default(true),
    removeTrailingSlash: boolean("remove_trailing_slash").notNull().default(false),
    lowercase: boolean("lowercase").notNull().default(true),
    appendLocale: boolean("append_locale").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("canonical_seo_profile_id_idx").on(table.seoProfileId)],
);

export const robots = pgTable(
  "robots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    seoProfileId: uuid("seo_profile_id")
      .notNull()
      .unique()
      .references(() => seoProfiles.id, { onDelete: "cascade", onUpdate: "cascade" }),
    index: boolean("index").notNull().default(true),
    follow: boolean("follow").notNull().default(true),
    archive: boolean("archive"),
    snippet: boolean("snippet"),
    imageIndex: boolean("image_index"),
    translate: boolean("translate"),
    maxSnippet: integer("max_snippet"),
    maxVideoPreview: integer("max_video_preview"),
    maxImagePreview: text("max_image_preview"),
    customDirectives: text("custom_directives"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("robots_seo_profile_id_idx").on(table.seoProfileId)],
);

export const openGraph = pgTable(
  "open_graph",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    seoProfileId: uuid("seo_profile_id")
      .notNull()
      .unique()
      .references(() => seoProfiles.id, { onDelete: "cascade", onUpdate: "cascade" }),
    ogTitle: text("og_title"),
    ogDescription: text("og_description"),
    ogImage: text("og_image"),
    ogImageWidth: integer("og_image_width"),
    ogImageHeight: integer("og_image_height"),
    ogType: text("og_type"),
    ogLocale: text("og_locale"),
    ogSiteName: text("og_site_name"),
    ogUrl: text("og_url"),
    video: text("video"),
    audio: text("audio"),
    determiner: text("determiner"),
    ttl: integer("ttl"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("open_graph_seo_profile_id_idx").on(table.seoProfileId)],
);

export const twitterCards = pgTable(
  "twitter_cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    seoProfileId: uuid("seo_profile_id")
      .notNull()
      .unique()
      .references(() => seoProfiles.id, { onDelete: "cascade", onUpdate: "cascade" }),
    cardType: text("card_type"),
    title: text("title"),
    description: text("description"),
    image: text("image"),
    creator: text("creator"),
    site: text("site"),
    imageAlt: text("image_alt"),
    player: text("player"),
    appName: text("app_name"),
    iphoneApp: text("iphone_app"),
    androidApp: text("android_app"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("twitter_cards_seo_profile_id_idx").on(table.seoProfileId)],
);

export const schemaDocuments = pgTable(
  "schema_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    seoProfileId: uuid("seo_profile_id")
      .notNull()
      .references(() => seoProfiles.id, { onDelete: "cascade", onUpdate: "cascade" }),
    schemaType: schemaTypeEnum("schema_type").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    priority: integer("priority").notNull().default(0),
    json: jsonb("json").notNull().default({}),
    validationStatus: text("validation_status"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("schema_documents_seo_profile_id_idx").on(table.seoProfileId),
    index("schema_documents_schema_type_idx").on(table.schemaType),
    index("schema_documents_enabled_idx").on(table.enabled),
  ],
);

export const redirectRules = pgTable(
  "redirect_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    source: text("source").notNull().unique(),
    destination: text("destination").notNull(),
    statusCode: redirectStatusCodeEnum("status_code").notNull().default("301"),
    enabled: boolean("enabled").notNull().default(true),
    hits: integer("hits").notNull().default(0),
    lastHitAt: timestamp("last_hit_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("redirect_rules_source_idx").on(table.source),
    index("redirect_rules_enabled_idx").on(table.enabled),
    index("redirect_rules_created_at_idx").on(table.createdAt),
  ],
);

export const hreflang = pgTable(
  "hreflang",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    seoProfileId: uuid("seo_profile_id")
      .notNull()
      .references(() => seoProfiles.id, { onDelete: "cascade", onUpdate: "cascade" }),
    language: languageEnum("language").notNull(),
    url: text("url").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("hreflang_seo_profile_id_idx").on(table.seoProfileId),
    index("hreflang_language_idx").on(table.language),
  ],
);

export const verificationCodes = pgTable(
  "verification_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: text("provider").notNull(),
    code: text("code").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("verification_codes_provider_idx").on(table.provider),
    index("verification_codes_is_active_idx").on(table.isActive),
  ],
);

export const customHeadTags = pgTable(
  "custom_head_tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    seoProfileId: uuid("seo_profile_id")
      .notNull()
      .references(() => seoProfiles.id, { onDelete: "cascade", onUpdate: "cascade" }),
    tagType: customHeadTagTypeEnum("tag_type").notNull(),
    content: text("content").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("custom_head_tags_seo_profile_id_idx").on(table.seoProfileId),
    index("custom_head_tags_tag_type_idx").on(table.tagType),
  ],
);

export const seoTemplates = pgTable(
  "seo_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerType: seoTemplateOwnerTypeEnum("owner_type").notNull(),
    language: languageEnum("language").notNull(),
    name: text("name").notNull(),
    metaTitleTemplate: text("meta_title_template"),
    metaDescriptionTemplate: text("meta_description_template"),
    ogTitleTemplate: text("og_title_template"),
    ogDescriptionTemplate: text("og_description_template"),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("seo_templates_owner_type_idx").on(table.ownerType),
    index("seo_templates_language_idx").on(table.language),
    index("seo_templates_is_default_idx").on(table.isDefault),
  ],
);

export const seoAnalysis = pgTable(
  "seo_analysis",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    seoProfileId: uuid("seo_profile_id")
      .notNull()
      .unique()
      .references(() => seoProfiles.id, { onDelete: "cascade", onUpdate: "cascade" }),
    overallScore: integer("overall_score").notNull().default(0),
    technicalScore: integer("technical_score").notNull().default(0),
    metadataScore: integer("metadata_score").notNull().default(0),
    schemaScore: integer("schema_score").notNull().default(0),
    contentScore: integer("content_score").notNull().default(0),
    imagesScore: integer("images_score").notNull().default(0),
    performanceScore: integer("performance_score").notNull().default(0),
    accessibilityScore: integer("accessibility_score").notNull().default(0),
    warnings: jsonb("warnings").notNull().default([]),
    errors: jsonb("errors").notNull().default([]),
    recommendations: jsonb("recommendations").notNull().default([]),
    lastScanAt: timestamp("last_scan_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("seo_analysis_seo_profile_id_idx").on(table.seoProfileId),
    index("seo_analysis_overall_score_idx").on(table.overallScore),
    index("seo_analysis_last_scan_at_idx").on(table.lastScanAt),
  ],
);

export const seoScoreHistory = pgTable(
  "seo_score_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    seoProfileId: uuid("seo_profile_id")
      .notNull()
      .references(() => seoProfiles.id, { onDelete: "cascade", onUpdate: "cascade" }),
    previousScore: integer("previous_score").notNull(),
    newScore: integer("new_score").notNull(),
    changedFields: jsonb("changed_fields").notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("seo_score_history_seo_profile_id_idx").on(table.seoProfileId),
    index("seo_score_history_created_at_idx").on(table.createdAt),
  ],
);

export const internalLinks = pgTable(
  "internal_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    seoProfileId: uuid("seo_profile_id")
      .notNull()
      .references(() => seoProfiles.id, { onDelete: "cascade", onUpdate: "cascade" }),
    targetOwnerType: seoOwnerTypeEnum("target_owner_type").notNull(),
    targetOwnerId: uuid("target_owner_id").notNull(),
    anchorText: text("anchor_text"),
    sortOrder: integer("sort_order").notNull().default(0),
    isAutomatic: boolean("is_automatic").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("internal_links_seo_profile_id_idx").on(table.seoProfileId),
    index("internal_links_target_owner_type_idx").on(table.targetOwnerType),
    index("internal_links_target_owner_id_idx").on(table.targetOwnerId),
  ],
);

export const sitemapConfig = pgTable(
  "sitemap_config",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerType: seoOwnerTypeEnum("owner_type").notNull(),
    ownerId: uuid("owner_id"),
    priority: numeric("priority", { precision: 2, scale: 1 }),
    changeFrequency: changeFrequencyEnum("change_frequency"),
    includeImages: boolean("include_images").notNull().default(true),
    includeVideos: boolean("include_videos").notNull().default(false),
    includeNews: boolean("include_news").notNull().default(false),
    isExcluded: boolean("is_excluded").notNull().default(false),
    autoGenerate: boolean("auto_generate").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("sitemap_config_owner_type_idx").on(table.ownerType),
    index("sitemap_config_owner_id_idx").on(table.ownerId),
  ],
);

export const robotsConfig = pgTable(
  "robots_config",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userAgent: text("user_agent").notNull().default("*"),
    allowRules: text("allow_rules"),
    disallowRules: text("disallow_rules"),
    host: text("host"),
    sitemapUrls: jsonb("sitemap_urls").notNull().default([]),
    customDirectives: text("custom_directives"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("robots_config_user_agent_idx").on(table.userAgent),
    index("robots_config_is_active_idx").on(table.isActive),
  ],
);
