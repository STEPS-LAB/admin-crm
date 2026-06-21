ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_profile_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "profile_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE cascade;