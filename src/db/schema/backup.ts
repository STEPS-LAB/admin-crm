import { bigint, boolean, index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { profiles } from "./auth";
import {
  backupStatusEnum,
  backupTriggerEnum,
  backupTypeEnum,
  backupValidationStatusEnum,
} from "./enums";

export const backupRecords = pgTable(
  "backup_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    status: backupStatusEnum("status").notNull().default("pending"),
    backupType: backupTypeEnum("backup_type").notNull().default("metadata"),
    triggeredBy: backupTriggerEnum("triggered_by").notNull().default("manual"),
    encrypted: boolean("encrypted").notNull().default(false),
    validationStatus: backupValidationStatusEnum("validation_status").notNull().default("pending"),
    isProtected: boolean("is_protected").notNull().default(false),
    manifestVersion: text("manifest_version"),
    storagePath: text("storage_path"),
    fileSize: bigint("file_size", { mode: "number" }),
    checksum: text("checksum"),
    metadata: jsonb("metadata"),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => profiles.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("backup_records_status_idx").on(table.status),
    index("backup_records_created_by_idx").on(table.createdBy),
    index("backup_records_created_at_idx").on(table.createdAt),
    index("backup_records_completed_at_idx").on(table.completedAt),
  ],
);
