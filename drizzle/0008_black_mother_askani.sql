ALTER TABLE "settings" ADD COLUMN "rate_limit_search_per_minute" integer DEFAULT 60 NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "rate_limit_import_per_minute" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "rate_limit_export_per_minute" integer DEFAULT 10 NOT NULL;