import { maskRecord } from "@/lib/import-export/maskSensitiveData";
import { findSettings } from "@/repositories/settingsRepository";

import type { ExportFormat } from "@/constants/import-export";
import type { ExportFilePayload } from "@/types/import-export";

function buildFilename(format: ExportFormat): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `settings-export-${timestamp}.${format}`;
}

export async function exportSettingsSnapshot(format: ExportFormat): Promise<ExportFilePayload> {
  const settings = await findSettings();

  if (!settings) {
    throw new Error("Settings record not found");
  }

  const snapshot = maskRecord(settings as unknown as Record<string, unknown>);

  if (format === "json") {
    return {
      filename: buildFilename(format),
      mimeType: "application/json",
      content: JSON.stringify(snapshot, null, 2),
    };
  }

  const entries = Object.entries(snapshot).map(([key, value]) => ({
    key,
    value: typeof value === "string" ? value : JSON.stringify(value),
  }));

  const headers = ["key", "value"] as const;
  const lines = [
    headers.join(","),
    ...entries.map((entry) =>
      [entry.key, `"${String(entry.value).replace(/"/g, '""')}"`].join(","),
    ),
  ];

  return {
    filename: buildFilename(format),
    mimeType: "text/csv;charset=utf-8",
    content: lines.join("\n"),
  };
}
