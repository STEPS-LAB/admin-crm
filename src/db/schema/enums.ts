import { pgEnum } from "drizzle-orm/pg-core";

export const languageEnum = pgEnum("language", ["uk", "en"]);

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "published",
  "archived",
  "hidden",
]);

export const stockStatusEnum = pgEnum("stock_status", [
  "in_stock",
  "out_of_stock",
  "preorder",
  "discontinued",
]);

export const categoryStatusEnum = pgEnum("category_status", [
  "draft",
  "published",
  "archived",
  "hidden",
]);

export const brandStatusEnum = pgEnum("brand_status", ["draft", "published", "archived", "hidden"]);

export const pageStatusEnum = pgEnum("page_status", ["draft", "published", "archived", "hidden"]);

export const pageTypeEnum = pgEnum("page_type", [
  "homepage",
  "static",
  "landing",
  "legal",
  "custom",
]);

export const seoOwnerTypeEnum = pgEnum("seo_owner_type", [
  "product",
  "category",
  "page",
  "brand",
  "collection",
  "tag",
  "landing_page",
]);

export const changeFrequencyEnum = pgEnum("change_frequency", [
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
]);

export const schemaTypeEnum = pgEnum("schema_type", [
  "product",
  "organization",
  "website",
  "webpage",
  "faq",
  "breadcrumb",
  "person",
  "review",
  "aggregate_rating",
  "offer",
  "local_business",
  "service",
  "article",
  "news_article",
  "video_object",
  "image_object",
  "search_action",
  "event",
  "software_application",
  "recipe",
  "book",
  "course",
  "how_to",
  "dataset",
  "medical_entity",
  "custom",
]);

export const redirectStatusCodeEnum = pgEnum("redirect_status_code", ["301", "302", "307", "308"]);

export const mediaOwnerTypeEnum = pgEnum("media_owner_type", [
  "product",
  "category",
  "brand",
  "page",
  "seo",
  "settings",
]);

export const mediaUsageTypeEnum = pgEnum("media_usage_type", [
  "cover",
  "gallery",
  "icon",
  "thumbnail",
  "open_graph",
  "twitter",
  "logo",
  "banner",
  "attachment",
  "custom",
]);

export const historyEntityTypeEnum = pgEnum("history_entity_type", [
  "product",
  "category",
  "seo_profile",
  "metadata",
  "schema",
  "redirect",
  "media",
  "settings",
  "page",
  "brand",
  "system",
]);

export const historyOperationEnum = pgEnum("history_operation", [
  "create",
  "update",
  "delete",
  "restore",
  "publish",
  "unpublish",
  "login",
  "logout",
  "import",
  "export",
  "generate",
  "scan",
  "system",
]);

export const auditActionEnum = pgEnum("audit_action", [
  "LOGIN",
  "LOGOUT",
  "FAILED_LOGIN",
  "PASSWORD_RESET",
  "PROFILE_UPDATED",
]);

export const themeEnum = pgEnum("theme", ["light", "dark", "system"]);

export const layoutDensityEnum = pgEnum("layout_density", ["compact", "comfortable"]);

export const twitterCardTypeEnum = pgEnum("twitter_card_type", [
  "summary",
  "summary_large_image",
  "player",
  "app",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "info",
  "success",
  "warning",
  "error",
  "seo",
  "system",
]);

export const backupStatusEnum = pgEnum("backup_status", [
  "pending",
  "in_progress",
  "completed",
  "failed",
]);

export const backupTypeEnum = pgEnum("backup_type", ["metadata", "full"]);

export const backupTriggerEnum = pgEnum("backup_trigger", [
  "manual",
  "scheduled",
  "pre_restore",
]);

export const backupValidationStatusEnum = pgEnum("backup_validation_status", [
  "pending",
  "valid",
  "warning",
  "invalid",
]);

export const customHeadTagTypeEnum = pgEnum("custom_head_tag_type", [
  "meta",
  "link",
  "script",
  "style",
  "noscript",
  "base",
  "custom",
]);

export const seoTemplateOwnerTypeEnum = pgEnum("seo_template_owner_type", [
  "product",
  "category",
  "page",
  "brand",
  "global",
]);

export const apiKeyStatusEnum = pgEnum("api_key_status", ["active", "revoked"]);

export const webhookEndpointStatusEnum = pgEnum("webhook_endpoint_status", ["active", "disabled"]);

export const webhookDeliveryStatusEnum = pgEnum("webhook_delivery_status", [
  "pending",
  "success",
  "failed",
  "dead",
]);

export const securityLevelEnum = pgEnum("security_level", ["standard", "enhanced", "enterprise"]);
