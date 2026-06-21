export const DEVELOPER_OPTION_LABELS = {
  developerModeEnabled: "Developer mode",
  showSqlQueries: "Show SQL queries",
  showApiTiming: "Show API timing",
  showServerActions: "Show server actions",
  mockDataEnabled: "Enable mock data",
  testModeEnabled: "Enable test mode",
  developerToolbarEnabled: "Developer toolbar",
  verboseLoggingEnabled: "Verbose logging",
} as const;

export const DEVELOPER_OPTION_DESCRIPTIONS = {
  developerModeEnabled:
    "Master switch for developer diagnostics. Automatically disabled in production deployments.",
  showSqlQueries: "Surface database query traces in server logs and developer tooling.",
  showApiTiming: "Record response timing for API routes and server actions.",
  showServerActions: "Log server action invocations with payload metadata in development.",
  mockDataEnabled: "Allow seeded mock entities for demos without affecting production records.",
  testModeEnabled: "Relax selected validation rules for QA workflows in non-production environments.",
  developerToolbarEnabled: "Display an in-app developer toolbar for admins when enabled.",
  verboseLoggingEnabled: "Emit debug-level structured logs across services.",
} as const;

export type DeveloperOptionKey = keyof typeof DEVELOPER_OPTION_LABELS;

export const DEVELOPER_OPTION_KEYS = Object.keys(DEVELOPER_OPTION_LABELS) as DeveloperOptionKey[];
