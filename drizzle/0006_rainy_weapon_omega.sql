CREATE TABLE "feature_flag_installations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"installed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flag_installations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "developer_mode_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "show_sql_queries" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "show_api_timing" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "show_server_actions" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "mock_data_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "test_mode_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "developer_toolbar_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "verbose_logging_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "feature_flag_installations_slug_idx" ON "feature_flag_installations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "feature_flag_installations_enabled_idx" ON "feature_flag_installations" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "feature_flag_installations_installed_at_idx" ON "feature_flag_installations" USING btree ("installed_at");