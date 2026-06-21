export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly avatarUrl: string | null;
  readonly locale: string;
  readonly timezone: string;
  readonly isActive: boolean;
}

export interface SessionMetadata {
  readonly id: string;
  readonly profileId: string;
  readonly deviceName: string | null;
  readonly browser: string | null;
  readonly operatingSystem: string | null;
  readonly lastActivity: Date | null;
  readonly expiresAt: Date | null;
  readonly createdAt: Date;
}

export type AuditActionType = "LOGIN" | "LOGOUT" | "FAILED_LOGIN" | "PASSWORD_RESET" | "PROFILE_UPDATED";
