export type SystemHealthStatus = "healthy" | "warning" | "critical" | "offline";

export interface SystemInfoSnapshot {
  readonly applicationVersion: string;
  readonly nextVersion: string;
  readonly reactVersion: string;
  readonly nodeVersion: string;
  readonly environment: string;
  readonly databaseStatus: SystemHealthStatus;
  readonly settingsUpdatedAt: string;
  readonly isProduction: boolean;
}
