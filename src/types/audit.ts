import type { AuditActionType } from "@/types/auth";

export interface SecurityAuditListItem {
  readonly id: string;
  readonly action: AuditActionType;
  readonly actorName: string | null;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  readonly createdAt: Date;
}

export interface HistoryAuditListItem {
  readonly id: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly operation: string;
  readonly changeSummary: string;
  readonly actorName: string | null;
  readonly ipAddress: string | null;
  readonly isSystemAction: boolean;
  readonly createdAt: Date;
}

export interface HistoryAuditDetail {
  readonly id: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly operation: string;
  readonly changeSummary: string;
  readonly actorName: string | null;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  readonly isSystemAction: boolean;
  readonly beforeData: Record<string, unknown> | null;
  readonly afterData: Record<string, unknown> | null;
  readonly changedFields: string[] | null;
  readonly reason: string | null;
  readonly createdAt: Date;
}

export interface SecurityAuditListFilters {
  readonly page: number;
  readonly pageSize: number;
  readonly search?: string | undefined;
  readonly action?: AuditActionType | undefined;
}

export interface HistoryAuditListFilters {
  readonly page: number;
  readonly pageSize: number;
  readonly search?: string | undefined;
  readonly entityType?: string | undefined;
  readonly operation?: string | undefined;
}
