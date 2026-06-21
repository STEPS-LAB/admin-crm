CREATE TYPE "public"."audit_action" AS ENUM('LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'PASSWORD_RESET', 'PROFILE_UPDATED');--> statement-breakpoint
CREATE TYPE "public"."backup_status" AS ENUM('pending', 'in_progress', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."brand_status" AS ENUM('draft', 'published', 'archived', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."category_status" AS ENUM('draft', 'published', 'archived', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."change_frequency" AS ENUM('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never');--> statement-breakpoint
CREATE TYPE "public"."custom_head_tag_type" AS ENUM('meta', 'link', 'script', 'style', 'noscript', 'base', 'custom');--> statement-breakpoint
CREATE TYPE "public"."history_entity_type" AS ENUM('product', 'category', 'seo_profile', 'metadata', 'schema', 'redirect', 'media', 'settings', 'page', 'brand', 'system');--> statement-breakpoint
CREATE TYPE "public"."history_operation" AS ENUM('create', 'update', 'delete', 'restore', 'publish', 'unpublish', 'login', 'logout', 'import', 'export', 'generate', 'scan', 'system');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('uk', 'en');--> statement-breakpoint
CREATE TYPE "public"."layout_density" AS ENUM('compact', 'comfortable');--> statement-breakpoint
CREATE TYPE "public"."media_owner_type" AS ENUM('product', 'category', 'brand', 'page', 'seo', 'settings');--> statement-breakpoint
CREATE TYPE "public"."media_usage_type" AS ENUM('cover', 'gallery', 'icon', 'thumbnail', 'open_graph', 'twitter', 'logo', 'banner', 'attachment', 'custom');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('info', 'success', 'warning', 'error', 'seo', 'system');--> statement-breakpoint
CREATE TYPE "public"."page_status" AS ENUM('draft', 'published', 'archived', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."page_type" AS ENUM('homepage', 'static', 'landing', 'legal', 'custom');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'published', 'archived', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."redirect_status_code" AS ENUM('301', '302', '307', '308');--> statement-breakpoint
CREATE TYPE "public"."schema_type" AS ENUM('product', 'organization', 'website', 'webpage', 'faq', 'breadcrumb', 'person', 'review', 'aggregate_rating', 'offer', 'local_business', 'service', 'article', 'news_article', 'video_object', 'image_object', 'search_action', 'event', 'software_application', 'recipe', 'book', 'course', 'how_to', 'dataset', 'medical_entity', 'custom');--> statement-breakpoint
CREATE TYPE "public"."seo_owner_type" AS ENUM('product', 'category', 'page', 'brand', 'collection', 'tag', 'landing_page');--> statement-breakpoint
CREATE TYPE "public"."seo_template_owner_type" AS ENUM('product', 'category', 'page', 'brand', 'global');--> statement-breakpoint
CREATE TYPE "public"."stock_status" AS ENUM('in_stock', 'out_of_stock', 'preorder', 'discontinued');--> statement-breakpoint
CREATE TYPE "public"."theme" AS ENUM('light', 'dark', 'system');--> statement-breakpoint
CREATE TYPE "public"."twitter_card_type" AS ENUM('summary', 'summary_large_image', 'player', 'app');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"action" "audit_action" NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"avatar_url" text,
	"locale" text DEFAULT 'uk' NOT NULL,
	"timezone" text DEFAULT 'Europe/Kyiv' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"device_name" text,
	"browser" text,
	"operating_system" text,
	"country" text,
	"city" text,
	"last_activity" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "backup_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "backup_status" DEFAULT 'pending' NOT NULL,
	"storage_path" text,
	"file_size" bigint,
	"checksum" text,
	"metadata" jsonb,
	"error_message" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"language" "language" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"logo_url" text,
	"website" text,
	"country" text,
	"status" "brand_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"image_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "category_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "category_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"language" "language" NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_attribute_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"label_uk" text NOT NULL,
	"label_en" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_filterable" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_attribute_definitions_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "product_attribute_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"definition_id" uuid NOT NULL,
	"value_uk" text,
	"value_en" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"language" "language" NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"short_description" text,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sku" text NOT NULL,
	"barcode" text,
	"brand_id" uuid,
	"category_id" uuid NOT NULL,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"old_price" numeric(12, 2),
	"currency" text DEFAULT 'UAH' NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"stock_status" "stock_status" DEFAULT 'in_stock' NOT NULL,
	"weight" numeric,
	"length" numeric,
	"width" numeric,
	"height" numeric,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "history_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" "history_entity_type" NOT NULL,
	"entity_id" uuid NOT NULL,
	"operation" "history_operation" NOT NULL,
	"performed_by" uuid,
	"performed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"session_id" uuid,
	"change_summary" text NOT NULL,
	"before_data" jsonb,
	"after_data" jsonb,
	"changed_fields" jsonb,
	"reason" text,
	"is_system_action" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"email_enabled" boolean DEFAULT true NOT NULL,
	"push_enabled" boolean DEFAULT true NOT NULL,
	"seo_alerts_enabled" boolean DEFAULT true NOT NULL,
	"system_alerts_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notification_settings_profile_id_unique" UNIQUE("profile_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid,
	"type" "notification_type" DEFAULT 'info' NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"link" text,
	"metadata" jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"language" "language" NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text,
	"excerpt" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_type" "page_type" DEFAULT 'static' NOT NULL,
	"status" "page_status" DEFAULT 'draft' NOT NULL,
	"is_homepage" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "canonical" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seo_profile_id" uuid NOT NULL,
	"canonical_url" text,
	"auto_generate" boolean DEFAULT true NOT NULL,
	"force_https" boolean DEFAULT true NOT NULL,
	"remove_trailing_slash" boolean DEFAULT false NOT NULL,
	"lowercase" boolean DEFAULT true NOT NULL,
	"append_locale" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "canonical_seo_profile_id_unique" UNIQUE("seo_profile_id")
);
--> statement-breakpoint
CREATE TABLE "custom_head_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seo_profile_id" uuid NOT NULL,
	"tag_type" "custom_head_tag_type" NOT NULL,
	"content" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hreflang" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seo_profile_id" uuid NOT NULL,
	"language" "language" NOT NULL,
	"url" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "internal_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seo_profile_id" uuid NOT NULL,
	"target_owner_type" "seo_owner_type" NOT NULL,
	"target_owner_id" uuid NOT NULL,
	"anchor_text" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_automatic" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "metadata" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seo_profile_id" uuid NOT NULL,
	"meta_title" text,
	"meta_description" text,
	"meta_keywords" text,
	"meta_author" text,
	"meta_generator" text,
	"application_name" text,
	"theme_color" text,
	"viewport" text,
	"referrer" text,
	"creator" text,
	"publisher" text,
	"copyright" text,
	"rating" text,
	"distribution" text,
	"revisit_after" text,
	"subject" text,
	"abstract" text,
	"news_keywords" text,
	"category" text,
	"classification" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "metadata_seo_profile_id_unique" UNIQUE("seo_profile_id")
);
--> statement-breakpoint
CREATE TABLE "open_graph" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seo_profile_id" uuid NOT NULL,
	"og_title" text,
	"og_description" text,
	"og_image" text,
	"og_image_width" integer,
	"og_image_height" integer,
	"og_type" text,
	"og_locale" text,
	"og_site_name" text,
	"og_url" text,
	"video" text,
	"audio" text,
	"determiner" text,
	"ttl" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "open_graph_seo_profile_id_unique" UNIQUE("seo_profile_id")
);
--> statement-breakpoint
CREATE TABLE "redirect_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text NOT NULL,
	"destination" text NOT NULL,
	"status_code" "redirect_status_code" DEFAULT '301' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"hits" integer DEFAULT 0 NOT NULL,
	"last_hit_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "redirect_rules_source_unique" UNIQUE("source")
);
--> statement-breakpoint
CREATE TABLE "robots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seo_profile_id" uuid NOT NULL,
	"index" boolean DEFAULT true NOT NULL,
	"follow" boolean DEFAULT true NOT NULL,
	"archive" boolean,
	"snippet" boolean,
	"image_index" boolean,
	"translate" boolean,
	"max_snippet" integer,
	"max_video_preview" integer,
	"max_image_preview" text,
	"custom_directives" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "robots_seo_profile_id_unique" UNIQUE("seo_profile_id")
);
--> statement-breakpoint
CREATE TABLE "robots_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_agent" text DEFAULT '*' NOT NULL,
	"allow_rules" text,
	"disallow_rules" text,
	"host" text,
	"sitemap_urls" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"custom_directives" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schema_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seo_profile_id" uuid NOT NULL,
	"schema_type" "schema_type" NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"validation_status" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seo_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seo_profile_id" uuid NOT NULL,
	"overall_score" integer DEFAULT 0 NOT NULL,
	"technical_score" integer DEFAULT 0 NOT NULL,
	"metadata_score" integer DEFAULT 0 NOT NULL,
	"schema_score" integer DEFAULT 0 NOT NULL,
	"content_score" integer DEFAULT 0 NOT NULL,
	"images_score" integer DEFAULT 0 NOT NULL,
	"performance_score" integer DEFAULT 0 NOT NULL,
	"accessibility_score" integer DEFAULT 0 NOT NULL,
	"warnings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"errors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"recommendations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"last_scan_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "seo_analysis_seo_profile_id_unique" UNIQUE("seo_profile_id")
);
--> statement-breakpoint
CREATE TABLE "seo_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_type" "seo_owner_type" NOT NULL,
	"owner_id" uuid NOT NULL,
	"language" "language" NOT NULL,
	"is_indexable" boolean DEFAULT true NOT NULL,
	"priority" numeric(2, 1) DEFAULT '0.5' NOT NULL,
	"change_frequency" "change_frequency" DEFAULT 'weekly' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "seo_score_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seo_profile_id" uuid NOT NULL,
	"previous_score" integer NOT NULL,
	"new_score" integer NOT NULL,
	"changed_fields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seo_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_type" "seo_template_owner_type" NOT NULL,
	"language" "language" NOT NULL,
	"name" text NOT NULL,
	"meta_title_template" text,
	"meta_description_template" text,
	"og_title_template" text,
	"og_description_template" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sitemap_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_type" "seo_owner_type" NOT NULL,
	"owner_id" uuid,
	"priority" numeric(2, 1),
	"change_frequency" "change_frequency",
	"include_images" boolean DEFAULT true NOT NULL,
	"include_videos" boolean DEFAULT false NOT NULL,
	"include_news" boolean DEFAULT false NOT NULL,
	"is_excluded" boolean DEFAULT false NOT NULL,
	"auto_generate" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "twitter_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seo_profile_id" uuid NOT NULL,
	"card_type" text,
	"title" text,
	"description" text,
	"image" text,
	"creator" text,
	"site" text,
	"image_alt" text,
	"player" text,
	"app_name" text,
	"iphone_app" text,
	"android_app" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "twitter_cards_seo_profile_id_unique" UNIQUE("seo_profile_id")
);
--> statement-breakpoint
CREATE TABLE "verification_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"code" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_name" text NOT NULL,
	"site_description" text,
	"site_url" text NOT NULL,
	"default_language" "language" DEFAULT 'uk' NOT NULL,
	"supported_languages" text[] DEFAULT '{"uk","en"}' NOT NULL,
	"timezone" text DEFAULT 'Europe/Kyiv' NOT NULL,
	"currency" text DEFAULT 'UAH' NOT NULL,
	"logo_url" text,
	"favicon_url" text,
	"default_meta_title" text,
	"default_meta_description" text,
	"default_og_image" text,
	"default_twitter_card" "twitter_card_type" DEFAULT 'summary_large_image',
	"default_indexing" boolean DEFAULT true NOT NULL,
	"default_follow" boolean DEFAULT true NOT NULL,
	"default_robots" text DEFAULT 'index, follow' NOT NULL,
	"sitemap_enabled" boolean DEFAULT true NOT NULL,
	"sitemap_auto_generate" boolean DEFAULT true NOT NULL,
	"sitemap_update_frequency" "change_frequency" DEFAULT 'daily',
	"sitemap_include_images" boolean DEFAULT true NOT NULL,
	"sitemap_include_videos" boolean DEFAULT false NOT NULL,
	"robots_enabled" boolean DEFAULT true NOT NULL,
	"robots_content" text,
	"theme" "theme" DEFAULT 'system' NOT NULL,
	"primary_color" text,
	"border_radius" integer DEFAULT 8 NOT NULL,
	"layout_density" "layout_density" DEFAULT 'comfortable' NOT NULL,
	"head_scripts" text,
	"body_scripts" text,
	"footer_scripts" text,
	"allow_custom_scripts" boolean DEFAULT false NOT NULL,
	"google_analytics_id" text,
	"google_tag_manager_id" text,
	"google_search_console_verification" text,
	"bing_webmaster_verification" text,
	"facebook_pixel_id" text,
	"maintenance_mode" boolean DEFAULT false NOT NULL,
	"debug_mode" boolean DEFAULT false NOT NULL,
	"cache_enabled" boolean DEFAULT true NOT NULL,
	"seo_automation_enabled" boolean DEFAULT true NOT NULL,
	"auto_generate_schemas" boolean DEFAULT true NOT NULL,
	"auto_generate_metadata" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"storage_bucket" text NOT NULL,
	"storage_path" text NOT NULL,
	"original_filename" text NOT NULL,
	"generated_filename" text NOT NULL,
	"extension" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" bigint NOT NULL,
	"width" integer,
	"height" integer,
	"aspect_ratio" numeric(6, 3),
	"dominant_color" text,
	"blurhash" text,
	"sha256_hash" text NOT NULL,
	"alt_uk" text,
	"alt_en" text,
	"title_uk" text,
	"title_en" text,
	"caption_uk" text,
	"caption_en" text,
	"copyright" text,
	"photographer" text,
	"license" text,
	"is_public" boolean DEFAULT true NOT NULL,
	"is_optimized" boolean DEFAULT false NOT NULL,
	"has_webp" boolean DEFAULT false NOT NULL,
	"has_avif" boolean DEFAULT false NOT NULL,
	"has_thumbnail" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "media_assets_storage_path_unique" UNIQUE("storage_path"),
	CONSTRAINT "media_assets_sha256_hash_unique" UNIQUE("sha256_hash")
);
--> statement-breakpoint
CREATE TABLE "media_collection_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" uuid NOT NULL,
	"media_asset_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "media_collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "media_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_asset_id" uuid NOT NULL,
	"owner_type" "media_owner_type" NOT NULL,
	"owner_id" uuid NOT NULL,
	"usage_type" "media_usage_type" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "backup_records" ADD CONSTRAINT "backup_records_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "brand_translations" ADD CONSTRAINT "brand_translations_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "product_attribute_values" ADD CONSTRAINT "product_attribute_values_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "product_attribute_values" ADD CONSTRAINT "product_attribute_values_definition_id_product_attribute_definitions_id_fk" FOREIGN KEY ("definition_id") REFERENCES "public"."product_attribute_definitions"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "history_entries" ADD CONSTRAINT "history_entries_performed_by_profiles_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "page_translations" ADD CONSTRAINT "page_translations_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "canonical" ADD CONSTRAINT "canonical_seo_profile_id_seo_profiles_id_fk" FOREIGN KEY ("seo_profile_id") REFERENCES "public"."seo_profiles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "custom_head_tags" ADD CONSTRAINT "custom_head_tags_seo_profile_id_seo_profiles_id_fk" FOREIGN KEY ("seo_profile_id") REFERENCES "public"."seo_profiles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "hreflang" ADD CONSTRAINT "hreflang_seo_profile_id_seo_profiles_id_fk" FOREIGN KEY ("seo_profile_id") REFERENCES "public"."seo_profiles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "internal_links" ADD CONSTRAINT "internal_links_seo_profile_id_seo_profiles_id_fk" FOREIGN KEY ("seo_profile_id") REFERENCES "public"."seo_profiles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "metadata" ADD CONSTRAINT "metadata_seo_profile_id_seo_profiles_id_fk" FOREIGN KEY ("seo_profile_id") REFERENCES "public"."seo_profiles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "open_graph" ADD CONSTRAINT "open_graph_seo_profile_id_seo_profiles_id_fk" FOREIGN KEY ("seo_profile_id") REFERENCES "public"."seo_profiles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "robots" ADD CONSTRAINT "robots_seo_profile_id_seo_profiles_id_fk" FOREIGN KEY ("seo_profile_id") REFERENCES "public"."seo_profiles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "schema_documents" ADD CONSTRAINT "schema_documents_seo_profile_id_seo_profiles_id_fk" FOREIGN KEY ("seo_profile_id") REFERENCES "public"."seo_profiles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "seo_analysis" ADD CONSTRAINT "seo_analysis_seo_profile_id_seo_profiles_id_fk" FOREIGN KEY ("seo_profile_id") REFERENCES "public"."seo_profiles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "seo_score_history" ADD CONSTRAINT "seo_score_history_seo_profile_id_seo_profiles_id_fk" FOREIGN KEY ("seo_profile_id") REFERENCES "public"."seo_profiles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "twitter_cards" ADD CONSTRAINT "twitter_cards_seo_profile_id_seo_profiles_id_fk" FOREIGN KEY ("seo_profile_id") REFERENCES "public"."seo_profiles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "media_collection_items" ADD CONSTRAINT "media_collection_items_collection_id_media_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."media_collections"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "media_collection_items" ADD CONSTRAINT "media_collection_items_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "media_usage" ADD CONSTRAINT "media_usage_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "audit_logs_profile_id_idx" ON "audit_logs" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "profiles_email_idx" ON "profiles" USING btree ("email");--> statement-breakpoint
CREATE INDEX "profiles_display_name_idx" ON "profiles" USING btree ("display_name");--> statement-breakpoint
CREATE INDEX "profiles_is_active_idx" ON "profiles" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "sessions_profile_id_idx" ON "sessions" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "backup_records_status_idx" ON "backup_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "backup_records_created_by_idx" ON "backup_records" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "backup_records_created_at_idx" ON "backup_records" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "backup_records_completed_at_idx" ON "backup_records" USING btree ("completed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "brand_translations_language_slug_idx" ON "brand_translations" USING btree ("language","brand_id");--> statement-breakpoint
CREATE INDEX "brand_translations_brand_id_idx" ON "brand_translations" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "brand_translations_language_idx" ON "brand_translations" USING btree ("language");--> statement-breakpoint
CREATE INDEX "brand_translations_name_idx" ON "brand_translations" USING btree ("name");--> statement-breakpoint
CREATE INDEX "brands_slug_idx" ON "brands" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "brands_status_idx" ON "brands" USING btree ("status");--> statement-breakpoint
CREATE INDEX "brands_created_at_idx" ON "brands" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "categories_parent_id_idx" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "categories_status_idx" ON "categories" USING btree ("status");--> statement-breakpoint
CREATE INDEX "categories_sort_order_idx" ON "categories" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "categories_parent_id_sort_order_idx" ON "categories" USING btree ("parent_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "category_translations_language_slug_idx" ON "category_translations" USING btree ("language","slug");--> statement-breakpoint
CREATE INDEX "category_translations_category_id_idx" ON "category_translations" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "category_translations_language_idx" ON "category_translations" USING btree ("language");--> statement-breakpoint
CREATE INDEX "category_translations_name_idx" ON "category_translations" USING btree ("name");--> statement-breakpoint
CREATE INDEX "product_attribute_definitions_key_idx" ON "product_attribute_definitions" USING btree ("key");--> statement-breakpoint
CREATE INDEX "product_attribute_definitions_sort_order_idx" ON "product_attribute_definitions" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "product_attribute_values_product_id_idx" ON "product_attribute_values" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_attribute_values_definition_id_idx" ON "product_attribute_values" USING btree ("definition_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_attribute_values_product_definition_idx" ON "product_attribute_values" USING btree ("product_id","definition_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_translations_language_slug_idx" ON "product_translations" USING btree ("language","slug");--> statement-breakpoint
CREATE INDEX "product_translations_product_id_idx" ON "product_translations" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_translations_language_idx" ON "product_translations" USING btree ("language");--> statement-breakpoint
CREATE INDEX "product_translations_name_idx" ON "product_translations" USING btree ("name");--> statement-breakpoint
CREATE INDEX "product_translations_language_slug_composite_idx" ON "product_translations" USING btree ("language","slug");--> statement-breakpoint
CREATE INDEX "products_sku_idx" ON "products" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "products_barcode_idx" ON "products" USING btree ("barcode");--> statement-breakpoint
CREATE INDEX "products_category_id_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_brand_id_idx" ON "products" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "products_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "products_published_at_idx" ON "products" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "products_price_idx" ON "products" USING btree ("price");--> statement-breakpoint
CREATE INDEX "products_stock_quantity_idx" ON "products" USING btree ("stock_quantity");--> statement-breakpoint
CREATE INDEX "products_category_id_status_idx" ON "products" USING btree ("category_id","status");--> statement-breakpoint
CREATE INDEX "products_status_created_at_idx" ON "products" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "products_status_published_at_idx" ON "products" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "products_brand_id_status_idx" ON "products" USING btree ("brand_id","status");--> statement-breakpoint
CREATE INDEX "products_status_price_idx" ON "products" USING btree ("status","price");--> statement-breakpoint
CREATE INDEX "history_entries_entity_type_idx" ON "history_entries" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "history_entries_entity_id_idx" ON "history_entries" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "history_entries_performed_by_idx" ON "history_entries" USING btree ("performed_by");--> statement-breakpoint
CREATE INDEX "history_entries_performed_at_idx" ON "history_entries" USING btree ("performed_at");--> statement-breakpoint
CREATE INDEX "history_entries_operation_idx" ON "history_entries" USING btree ("operation");--> statement-breakpoint
CREATE INDEX "history_entries_created_at_idx" ON "history_entries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "history_entries_entity_type_entity_id_idx" ON "history_entries" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "notification_settings_profile_id_idx" ON "notification_settings" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "notifications_profile_id_idx" ON "notifications" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notifications_is_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "page_translations_language_slug_idx" ON "page_translations" USING btree ("language","slug");--> statement-breakpoint
CREATE INDEX "page_translations_page_id_idx" ON "page_translations" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX "page_translations_language_idx" ON "page_translations" USING btree ("language");--> statement-breakpoint
CREATE INDEX "page_translations_title_idx" ON "page_translations" USING btree ("title");--> statement-breakpoint
CREATE INDEX "pages_page_type_idx" ON "pages" USING btree ("page_type");--> statement-breakpoint
CREATE INDEX "pages_status_idx" ON "pages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pages_is_homepage_idx" ON "pages" USING btree ("is_homepage");--> statement-breakpoint
CREATE INDEX "pages_published_at_idx" ON "pages" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "pages_status_created_at_idx" ON "pages" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "canonical_seo_profile_id_idx" ON "canonical" USING btree ("seo_profile_id");--> statement-breakpoint
CREATE INDEX "custom_head_tags_seo_profile_id_idx" ON "custom_head_tags" USING btree ("seo_profile_id");--> statement-breakpoint
CREATE INDEX "custom_head_tags_tag_type_idx" ON "custom_head_tags" USING btree ("tag_type");--> statement-breakpoint
CREATE INDEX "hreflang_seo_profile_id_idx" ON "hreflang" USING btree ("seo_profile_id");--> statement-breakpoint
CREATE INDEX "hreflang_language_idx" ON "hreflang" USING btree ("language");--> statement-breakpoint
CREATE INDEX "internal_links_seo_profile_id_idx" ON "internal_links" USING btree ("seo_profile_id");--> statement-breakpoint
CREATE INDEX "internal_links_target_owner_type_idx" ON "internal_links" USING btree ("target_owner_type");--> statement-breakpoint
CREATE INDEX "internal_links_target_owner_id_idx" ON "internal_links" USING btree ("target_owner_id");--> statement-breakpoint
CREATE INDEX "metadata_seo_profile_id_idx" ON "metadata" USING btree ("seo_profile_id");--> statement-breakpoint
CREATE INDEX "open_graph_seo_profile_id_idx" ON "open_graph" USING btree ("seo_profile_id");--> statement-breakpoint
CREATE INDEX "redirect_rules_source_idx" ON "redirect_rules" USING btree ("source");--> statement-breakpoint
CREATE INDEX "redirect_rules_enabled_idx" ON "redirect_rules" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "redirect_rules_created_at_idx" ON "redirect_rules" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "robots_seo_profile_id_idx" ON "robots" USING btree ("seo_profile_id");--> statement-breakpoint
CREATE INDEX "robots_config_user_agent_idx" ON "robots_config" USING btree ("user_agent");--> statement-breakpoint
CREATE INDEX "robots_config_is_active_idx" ON "robots_config" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "schema_documents_seo_profile_id_idx" ON "schema_documents" USING btree ("seo_profile_id");--> statement-breakpoint
CREATE INDEX "schema_documents_schema_type_idx" ON "schema_documents" USING btree ("schema_type");--> statement-breakpoint
CREATE INDEX "schema_documents_enabled_idx" ON "schema_documents" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "seo_analysis_seo_profile_id_idx" ON "seo_analysis" USING btree ("seo_profile_id");--> statement-breakpoint
CREATE INDEX "seo_analysis_overall_score_idx" ON "seo_analysis" USING btree ("overall_score");--> statement-breakpoint
CREATE INDEX "seo_analysis_last_scan_at_idx" ON "seo_analysis" USING btree ("last_scan_at");--> statement-breakpoint
CREATE UNIQUE INDEX "seo_profiles_owner_type_owner_id_language_idx" ON "seo_profiles" USING btree ("owner_type","owner_id","language");--> statement-breakpoint
CREATE INDEX "seo_profiles_owner_type_idx" ON "seo_profiles" USING btree ("owner_type");--> statement-breakpoint
CREATE INDEX "seo_profiles_owner_id_idx" ON "seo_profiles" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "seo_profiles_language_idx" ON "seo_profiles" USING btree ("language");--> statement-breakpoint
CREATE INDEX "seo_profiles_is_indexable_idx" ON "seo_profiles" USING btree ("is_indexable");--> statement-breakpoint
CREATE INDEX "seo_profiles_owner_type_owner_id_language_composite_idx" ON "seo_profiles" USING btree ("owner_type","owner_id","language");--> statement-breakpoint
CREATE INDEX "seo_score_history_seo_profile_id_idx" ON "seo_score_history" USING btree ("seo_profile_id");--> statement-breakpoint
CREATE INDEX "seo_score_history_created_at_idx" ON "seo_score_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "seo_templates_owner_type_idx" ON "seo_templates" USING btree ("owner_type");--> statement-breakpoint
CREATE INDEX "seo_templates_language_idx" ON "seo_templates" USING btree ("language");--> statement-breakpoint
CREATE INDEX "seo_templates_is_default_idx" ON "seo_templates" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "sitemap_config_owner_type_idx" ON "sitemap_config" USING btree ("owner_type");--> statement-breakpoint
CREATE INDEX "sitemap_config_owner_id_idx" ON "sitemap_config" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "twitter_cards_seo_profile_id_idx" ON "twitter_cards" USING btree ("seo_profile_id");--> statement-breakpoint
CREATE INDEX "verification_codes_provider_idx" ON "verification_codes" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "verification_codes_is_active_idx" ON "verification_codes" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "settings_site_name_idx" ON "settings" USING btree ("site_name");--> statement-breakpoint
CREATE INDEX "media_assets_storage_bucket_idx" ON "media_assets" USING btree ("storage_bucket");--> statement-breakpoint
CREATE INDEX "media_assets_storage_path_idx" ON "media_assets" USING btree ("storage_path");--> statement-breakpoint
CREATE INDEX "media_assets_sha256_hash_idx" ON "media_assets" USING btree ("sha256_hash");--> statement-breakpoint
CREATE INDEX "media_assets_mime_type_idx" ON "media_assets" USING btree ("mime_type");--> statement-breakpoint
CREATE INDEX "media_assets_extension_idx" ON "media_assets" USING btree ("extension");--> statement-breakpoint
CREATE INDEX "media_assets_is_deleted_idx" ON "media_assets" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "media_assets_created_at_idx" ON "media_assets" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "media_collection_items_collection_asset_idx" ON "media_collection_items" USING btree ("collection_id","media_asset_id");--> statement-breakpoint
CREATE INDEX "media_collection_items_collection_id_idx" ON "media_collection_items" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "media_collection_items_media_asset_id_idx" ON "media_collection_items" USING btree ("media_asset_id");--> statement-breakpoint
CREATE INDEX "media_collections_slug_idx" ON "media_collections" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "media_collections_name_idx" ON "media_collections" USING btree ("name");--> statement-breakpoint
CREATE INDEX "media_usage_media_asset_id_idx" ON "media_usage" USING btree ("media_asset_id");--> statement-breakpoint
CREATE INDEX "media_usage_owner_type_idx" ON "media_usage" USING btree ("owner_type");--> statement-breakpoint
CREATE INDEX "media_usage_owner_id_idx" ON "media_usage" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "media_usage_owner_type_owner_id_idx" ON "media_usage" USING btree ("owner_type","owner_id");--> statement-breakpoint
CREATE INDEX "media_usage_usage_type_idx" ON "media_usage" USING btree ("usage_type");