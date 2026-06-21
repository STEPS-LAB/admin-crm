CREATE TYPE "public"."security_level" AS ENUM('standard', 'enhanced', 'enterprise');--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "security_level" "security_level" DEFAULT 'standard' NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "session_idle_timeout_hours" integer DEFAULT 8 NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "session_absolute_lifetime_hours" integer DEFAULT 24 NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "login_lockout_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "login_max_attempts" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "login_lockout_window_minutes" integer DEFAULT 15 NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "rate_limit_settings_per_minute" integer DEFAULT 20 NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "rate_limit_upload_per_minute" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "audit_log_login_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "audit_log_failed_login_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "audit_log_settings_change_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "audit_log_media_upload_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "audit_log_seo_change_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "ip_allow_list" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "ip_block_list" text[] DEFAULT '{}' NOT NULL;