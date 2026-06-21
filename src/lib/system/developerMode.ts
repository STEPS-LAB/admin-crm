import type { AdvancedSettingsValues } from "@/schemas/settings/settingsSchemas";

export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === "production";
}

export function sanitizeAdvancedSettings(
  input: AdvancedSettingsValues,
): AdvancedSettingsValues {
  if (isProductionEnvironment()) {
    return {
      developerModeEnabled: false,
      showSqlQueries: false,
      showApiTiming: false,
      showServerActions: false,
      mockDataEnabled: false,
      testModeEnabled: false,
      developerToolbarEnabled: false,
      verboseLoggingEnabled: false,
    };
  }

  if (!input.developerModeEnabled) {
    return {
      developerModeEnabled: false,
      showSqlQueries: false,
      showApiTiming: false,
      showServerActions: false,
      mockDataEnabled: false,
      testModeEnabled: false,
      developerToolbarEnabled: false,
      verboseLoggingEnabled: false,
    };
  }

  return input;
}

export function resolveDeveloperDiagnostics(
  settings: Pick<
    AdvancedSettingsValues,
    | "developerModeEnabled"
    | "showSqlQueries"
    | "showApiTiming"
    | "showServerActions"
    | "mockDataEnabled"
    | "testModeEnabled"
    | "developerToolbarEnabled"
    | "verboseLoggingEnabled"
  >,
): AdvancedSettingsValues {
  return sanitizeAdvancedSettings(settings);
}

export function countEnabledDeveloperOptions(
  settings: AdvancedSettingsValues,
): number {
  const resolved = resolveDeveloperDiagnostics(settings);

  return [
    resolved.showSqlQueries,
    resolved.showApiTiming,
    resolved.showServerActions,
    resolved.mockDataEnabled,
    resolved.testModeEnabled,
    resolved.developerToolbarEnabled,
    resolved.verboseLoggingEnabled,
  ].filter(Boolean).length;
}
