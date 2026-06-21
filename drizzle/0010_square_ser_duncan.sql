ALTER TABLE "settings" ADD COLUMN "storage_provider" text DEFAULT 'supabase' NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "max_upload_size_mb" integer DEFAULT 25 NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "image_compression_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "image_compression_quality" integer DEFAULT 80 NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "auto_webp_conversion" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "duplicate_detection_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "smtp_host" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "smtp_port" integer DEFAULT 587 NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "smtp_username" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "smtp_password_encrypted" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "smtp_encryption" text DEFAULT 'tls' NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "email_sender_name" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "email_sender_address" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "email_reply_to" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "cache_duration_seconds" integer DEFAULT 3600 NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "cache_auto_cleanup" boolean DEFAULT true NOT NULL;