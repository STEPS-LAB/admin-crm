import { readFileSync } from "node:fs";
import { join } from "node:path";

import { isProductionEnvironment } from "@/lib/system/developerMode";
import { findSettings } from "@/repositories/settingsRepository";

import type { SystemHealthStatus, SystemInfoSnapshot } from "@/types/system-info";

function readPackageVersion(packageName: string): string {
  try {
    const packageJsonPath = join(process.cwd(), "node_modules", packageName, "package.json");
    const contents = readFileSync(packageJsonPath, "utf8");
    const parsed = JSON.parse(contents) as { version?: string };

    return parsed.version ?? "unknown";
  } catch {
    return "unknown";
  }
}

function readApplicationVersion(): string {
  try {
    const packageJsonPath = join(process.cwd(), "package.json");
    const contents = readFileSync(packageJsonPath, "utf8");
    const parsed = JSON.parse(contents) as { version?: string };

    return parsed.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

async function resolveDatabaseStatus(): Promise<SystemHealthStatus> {
  try {
    const settings = await findSettings();
    return settings ? "healthy" : "warning";
  } catch {
    return "critical";
  }
}

export async function getSystemInfoSnapshot(): Promise<SystemInfoSnapshot> {
  const [settings, databaseStatus] = await Promise.all([
    findSettings(),
    resolveDatabaseStatus(),
  ]);

  return {
    applicationVersion: readApplicationVersion(),
    nextVersion: readPackageVersion("next"),
    reactVersion: readPackageVersion("react"),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV ?? "development",
    databaseStatus,
    settingsUpdatedAt: settings?.updatedAt.toISOString() ?? new Date(0).toISOString(),
    isProduction: isProductionEnvironment(),
  };
}
