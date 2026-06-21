import { describe, expect, it, vi } from "vitest";

import { BUNDLED_FEATURE_FLAGS } from "@/constants/feature-flags";
import {
  countEnabledDeveloperOptions,
  isProductionEnvironment,
  resolveDeveloperDiagnostics,
  sanitizeAdvancedSettings,
} from "@/lib/system/developerMode";
import { advancedSettingsSchema } from "@/schemas/settings/settingsSchemas";

describe("advancedSettingsSchema", () => {
  it("accepts developer mode with diagnostics", () => {
    const result = advancedSettingsSchema.safeParse({
      developerModeEnabled: true,
      showSqlQueries: true,
      showApiTiming: false,
      showServerActions: false,
      mockDataEnabled: false,
      testModeEnabled: false,
      developerToolbarEnabled: false,
      verboseLoggingEnabled: true,
    });

    expect(result.success).toBe(true);
  });

  it("rejects diagnostics when developer mode is disabled", () => {
    const result = advancedSettingsSchema.safeParse({
      developerModeEnabled: false,
      showSqlQueries: true,
      showApiTiming: false,
      showServerActions: false,
      mockDataEnabled: false,
      testModeEnabled: false,
      developerToolbarEnabled: false,
      verboseLoggingEnabled: false,
    });

    expect(result.success).toBe(false);
  });
});

describe("sanitizeAdvancedSettings", () => {
  it("disables all developer options in production", () => {
    vi.stubEnv("NODE_ENV", "production");

    const sanitized = sanitizeAdvancedSettings({
      developerModeEnabled: true,
      showSqlQueries: true,
      showApiTiming: true,
      showServerActions: true,
      mockDataEnabled: true,
      testModeEnabled: true,
      developerToolbarEnabled: true,
      verboseLoggingEnabled: true,
    });

    expect(sanitized.developerModeEnabled).toBe(false);
    expect(sanitized.showSqlQueries).toBe(false);

    vi.unstubAllEnvs();
  });

  it("clears diagnostics when developer mode is off", () => {
    const sanitized = sanitizeAdvancedSettings({
      developerModeEnabled: false,
      showSqlQueries: true,
      showApiTiming: true,
      showServerActions: false,
      mockDataEnabled: false,
      testModeEnabled: false,
      developerToolbarEnabled: false,
      verboseLoggingEnabled: false,
    });

    expect(sanitized.showSqlQueries).toBe(false);
    expect(sanitized.showApiTiming).toBe(false);
  });
});

describe("resolveDeveloperDiagnostics", () => {
  it("counts enabled diagnostics", () => {
    const resolved = resolveDeveloperDiagnostics({
      developerModeEnabled: true,
      showSqlQueries: true,
      showApiTiming: true,
      showServerActions: false,
      mockDataEnabled: false,
      testModeEnabled: false,
      developerToolbarEnabled: false,
      verboseLoggingEnabled: false,
    });

    expect(countEnabledDeveloperOptions(resolved)).toBe(2);
  });
});

describe("isProductionEnvironment", () => {
  it("reflects NODE_ENV", () => {
    vi.stubEnv("NODE_ENV", "test");
    expect(isProductionEnvironment()).toBe(false);
    vi.unstubAllEnvs();
  });
});

describe("BUNDLED_FEATURE_FLAGS", () => {
  it("contains unique slugs", () => {
    const slugs = BUNDLED_FEATURE_FLAGS.map((flag) => flag.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
