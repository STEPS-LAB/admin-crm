import { diffHistorySnapshots } from "@/lib/history/changeTracking";
import { createHistoryEntry } from "@/repositories/historyRepository";

import type { RequestMetadata } from "@/lib/security/requestMetadata";
import type { historyEntries } from "@/db/schema/history";

type HistoryEntityType = typeof historyEntries.$inferInsert["entityType"];
type HistoryOperation = typeof historyEntries.$inferInsert["operation"];

export interface HistoryMutationContext {
  readonly profileId: string | null;
  readonly metadata: RequestMetadata;
}

export interface RecordHistoryEntryInput {
  readonly entityType: HistoryEntityType;
  readonly entityId: string;
  readonly operation: HistoryOperation;
  readonly changeSummary: string;
  readonly context: HistoryMutationContext;
  readonly beforeData?: Record<string, unknown> | null;
  readonly afterData?: Record<string, unknown> | null;
  readonly changedFields?: string[];
}

export async function recordHistoryEntry(input: RecordHistoryEntryInput): Promise<void> {
  await createHistoryEntry({
    entityType: input.entityType,
    entityId: input.entityId,
    operation: input.operation,
    performedBy: input.context.profileId,
    changeSummary: input.changeSummary,
    beforeData: input.beforeData ?? null,
    afterData: input.afterData ?? null,
    ...(input.changedFields ? { changedFields: input.changedFields } : {}),
    ipAddress: input.context.metadata.ipAddress,
    userAgent: input.context.metadata.userAgent,
  });
}

export async function recordEntityCreate(
  entityType: HistoryEntityType,
  entityId: string,
  changeSummary: string,
  afterData: Record<string, unknown>,
  context: HistoryMutationContext,
): Promise<void> {
  await recordHistoryEntry({
    entityType,
    entityId,
    operation: "create",
    changeSummary,
    afterData,
    context,
  });
}

export async function recordEntityUpdate(
  entityType: HistoryEntityType,
  entityId: string,
  changeSummary: string,
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  context: HistoryMutationContext,
): Promise<void> {
  const diff = diffHistorySnapshots(before, after);

  if (!diff) {
    return;
  }

  await recordHistoryEntry({
    entityType,
    entityId,
    operation: "update",
    changeSummary,
    beforeData: diff.beforeData,
    afterData: diff.afterData,
    changedFields: diff.changedFields,
    context,
  });
}

export async function recordEntityDelete(
  entityType: HistoryEntityType,
  entityId: string,
  changeSummary: string,
  beforeData: Record<string, unknown>,
  context: HistoryMutationContext,
): Promise<void> {
  await recordHistoryEntry({
    entityType,
    entityId,
    operation: "delete",
    changeSummary,
    beforeData,
    context,
  });
}

export async function recordEntityRestore(
  entityType: HistoryEntityType,
  entityId: string,
  changeSummary: string,
  afterData: Record<string, unknown>,
  context: HistoryMutationContext,
): Promise<void> {
  await recordHistoryEntry({
    entityType,
    entityId,
    operation: "restore",
    changeSummary,
    afterData,
    context,
  });
}

export function resolvePublishOperation(
  beforeStatus: string,
  afterStatus: string,
): "publish" | "unpublish" | null {
  if (beforeStatus === afterStatus) {
    return null;
  }

  if (afterStatus === "published") {
    return "publish";
  }

  if (beforeStatus === "published") {
    return "unpublish";
  }

  return null;
}

export async function recordEntityStatusChange(
  entityType: HistoryEntityType,
  entityId: string,
  changeSummary: string,
  beforeStatus: string,
  afterStatus: string,
  context: HistoryMutationContext,
): Promise<void> {
  const operation = resolvePublishOperation(beforeStatus, afterStatus) ?? "update";

  await recordHistoryEntry({
    entityType,
    entityId,
    operation,
    changeSummary,
    beforeData: { status: beforeStatus },
    afterData: { status: afterStatus },
    changedFields: ["status"],
    context,
  });
}
