import { findSettings } from "@/repositories/settingsRepository";
import { createAuditLog } from "@/repositories/auditRepository";

import type { AuditActionType } from "@/types/auth";
import type { RequestMetadata } from "@/lib/security/requestMetadata";

export interface LogAuthEventInput {
  readonly profileId: string | null;
  readonly action: AuditActionType;
  readonly metadata: RequestMetadata;
}

async function shouldLogAuthEvent(action: AuditActionType): Promise<boolean> {
  const settings = await findSettings();

  if (!settings) {
    return true;
  }

  if (action === "LOGIN") {
    return settings.auditLogLoginEnabled;
  }

  if (action === "FAILED_LOGIN") {
    return settings.auditLogFailedLoginEnabled;
  }

  return true;
}

export async function logAuthEvent(input: LogAuthEventInput): Promise<void> {
  const shouldLog = await shouldLogAuthEvent(input.action);

  if (!shouldLog) {
    return;
  }

  await createAuditLog({
    profileId: input.profileId,
    action: input.action,
    ipAddress: input.metadata.ipAddress,
    userAgent: input.metadata.userAgent,
  });
}
