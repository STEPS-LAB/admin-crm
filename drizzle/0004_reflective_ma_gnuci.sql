ALTER TABLE "settings" ADD COLUMN "fallback_language" "language" DEFAULT 'uk' NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "automatic_locale_detection" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "browser_language_detection" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "language_switcher_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "localized_urls_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "rtl_support_enabled" boolean DEFAULT false NOT NULL;