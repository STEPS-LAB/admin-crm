CREATE TYPE "public"."backup_trigger" AS ENUM('manual', 'scheduled', 'pre_restore');--> statement-breakpoint
CREATE TYPE "public"."backup_type" AS ENUM('metadata', 'full');--> statement-breakpoint
CREATE TYPE "public"."backup_validation_status" AS ENUM('pending', 'valid', 'warning', 'invalid');--> statement-breakpoint
ALTER TABLE "backup_records" ADD COLUMN "backup_type" "backup_type" DEFAULT 'metadata' NOT NULL;--> statement-breakpoint
ALTER TABLE "backup_records" ADD COLUMN "triggered_by" "backup_trigger" DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "backup_records" ADD COLUMN "encrypted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "backup_records" ADD COLUMN "validation_status" "backup_validation_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "backup_records" ADD COLUMN "is_protected" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "backup_records" ADD COLUMN "manifest_version" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "backup_schedule_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "backup_schedule_hour_utc" integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "backup_retention_max_count" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "backup_encryption_enabled" boolean DEFAULT true NOT NULL;