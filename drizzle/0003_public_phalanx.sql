CREATE TABLE "plugin_installations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"config" jsonb,
	"installed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plugin_installations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX "plugin_installations_slug_idx" ON "plugin_installations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "plugin_installations_enabled_idx" ON "plugin_installations" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "plugin_installations_installed_at_idx" ON "plugin_installations" USING btree ("installed_at");