import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import type { ApiCenterOverview } from "@/types/api";

export interface ApiOverviewStatsProps {
  readonly overview: ApiCenterOverview;
}

export function ApiOverviewStats({ overview }: ApiOverviewStatsProps): React.JSX.Element {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active keys</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{overview.activeKeyCount}</CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Revoked keys</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{overview.revokedKeyCount}</CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Rate limit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-2xl font-semibold">{overview.rateLimitPerMinute}</p>
          <p className="text-xs text-muted-foreground">requests / minute</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">API surfaces</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="success">Server Actions</Badge>
          <Badge variant="success">Public REST</Badge>
          <Badge variant="success">Webhooks</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
