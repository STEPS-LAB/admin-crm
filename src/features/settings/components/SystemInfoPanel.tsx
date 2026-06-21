import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { SystemHealthStatus, SystemInfoSnapshot } from "@/types/system-info";

export interface SystemInfoPanelProps {
  readonly info: SystemInfoSnapshot;
}

const STATUS_LABELS: Record<SystemHealthStatus, string> = {
  healthy: "Healthy",
  warning: "Warning",
  critical: "Critical",
  offline: "Offline",
};

const STATUS_VARIANTS: Record<
  SystemHealthStatus,
  "success" | "warning" | "destructive" | "secondary"
> = {
  healthy: "success",
  warning: "warning",
  critical: "destructive",
  offline: "secondary",
};

export function SystemInfoPanel({ info }: SystemInfoPanelProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">System information</CardTitle>
          <Badge variant="outline">{info.environment}</Badge>
          <Badge variant={STATUS_VARIANTS[info.databaseStatus]}>
            Database {STATUS_LABELS[info.databaseStatus]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">Read-only runtime metadata for support and diagnostics.</p>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Application version</dt>
            <dd className="font-medium">{info.applicationVersion}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Next.js</dt>
            <dd className="font-medium">{info.nextVersion}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">React</dt>
            <dd className="font-medium">{info.reactVersion}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Node.js</dt>
            <dd className="font-medium">{info.nodeVersion}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Settings updated</dt>
            <dd className="font-medium">{new Date(info.settingsUpdatedAt).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Production guard</dt>
            <dd className="font-medium">{info.isProduction ? "Enforced" : "Not required"}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
