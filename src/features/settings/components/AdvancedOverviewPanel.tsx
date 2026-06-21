import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  countEnabledDeveloperOptions,
  resolveDeveloperDiagnostics,
} from "@/lib/system/developerMode";

import type { SettingsRecord } from "@/types/settings";

export interface AdvancedOverviewPanelProps {
  readonly settings: SettingsRecord;
  readonly isProduction: boolean;
}

export function AdvancedOverviewPanel({
  settings,
  isProduction,
}: AdvancedOverviewPanelProps): React.JSX.Element {
  const resolved = resolveDeveloperDiagnostics(settings);
  const enabledDiagnostics = countEnabledDeveloperOptions(resolved);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Developer posture</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant={resolved.developerModeEnabled ? "warning" : "secondary"}>
            {resolved.developerModeEnabled ? "Developer mode active" : "Developer mode off"}
          </Badge>
          {enabledDiagnostics > 0 ? (
            <Badge variant="outline">{enabledDiagnostics} diagnostics enabled</Badge>
          ) : null}
          {isProduction ? <Badge variant="destructive">Production guard active</Badge> : null}
          {settings.debugMode ? <Badge variant="outline">System debug mode on</Badge> : null}
        </div>

        <p className="text-sm text-muted-foreground">
          Developer diagnostics are automatically stripped in production. System-level debug mode and
          script injection remain under{" "}
          <Link href="/admin/settings/system" className="text-primary hover:underline">
            System settings
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
