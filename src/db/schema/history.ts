import { boolean, index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { profiles } from "./auth";
import { historyEntityTypeEnum, historyOperationEnum } from "./enums";

export const historyEntries = pgTable(
  "history_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entityType: historyEntityTypeEnum("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    operation: historyOperationEnum("operation").notNull(),
    performedBy: uuid("performed_by").references(() => profiles.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    performedAt: timestamp("performed_at", { withTimezone: true }).defaultNow().notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    sessionId: uuid("session_id"),
    changeSummary: text("change_summary").notNull(),
    beforeData: jsonb("before_data"),
    afterData: jsonb("after_data"),
    changedFields: jsonb("changed_fields"),
    reason: text("reason"),
    isSystemAction: boolean("is_system_action").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("history_entries_entity_type_idx").on(table.entityType),
    index("history_entries_entity_id_idx").on(table.entityId),
    index("history_entries_performed_by_idx").on(table.performedBy),
    index("history_entries_performed_at_idx").on(table.performedAt),
    index("history_entries_operation_idx").on(table.operation),
    index("history_entries_created_at_idx").on(table.createdAt),
    index("history_entries_entity_type_entity_id_idx").on(table.entityType, table.entityId),
  ],
);
