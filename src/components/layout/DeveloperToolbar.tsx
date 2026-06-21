"use client";

import Link from "next/link";
import { Code2 } from "lucide-react";

import { DEVELOPER_OPTION_LABELS } from "@/constants/advanced-settings";
import { cn } from "@/lib/utils/cn";

import type { AdvancedSettingsValues } from "@/schemas/settings/settingsSchemas";

export interface DeveloperToolbarProps {
  readonly diagnostics: AdvancedSettingsValues;
}

export function DeveloperToolbar({ diagnostics }: DeveloperToolbarProps): React.JSX.Element | null {
  if (!diagnostics.developerToolbarEnabled) {
    return null;
  }

  const enabledOptions = (
    Object.entries(DEVELOPER_OPTION_LABELS) as Array<
      [keyof typeof DEVELOPER_OPTION_LABELS, string]
    >
  ).filter(([key]) => diagnostics[key]);

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-border/80 bg-background/95 p-3 shadow-lg backdrop-blur",
      )}
      role="status"
      aria-label="Developer toolbar"
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <Code2 className="h-4 w-4 text-primary" />
        Developer mode
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Runtime diagnostics are active for this session.
      </p>
      {enabledOptions.length > 0 ? (
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {enabledOptions.map(([key, label]) => (
            <li key={key}>• {label}</li>
          ))}
        </ul>
      ) : null}
      <Link
        href="/admin/settings/advanced"
        className="mt-3 inline-flex text-xs font-medium text-primary hover:underline"
      >
        Open advanced settings
      </Link>
    </div>
  );
}
