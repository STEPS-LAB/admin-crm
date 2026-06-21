import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import type { PluginCenterOverview } from "@/types/plugins";

export interface PluginOverviewStatsProps {
  readonly overview: PluginCenterOverview;
}

export function PluginOverviewStats({ overview }: PluginOverviewStatsProps): React.JSX.Element {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Enabled</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{overview.enabledCount}</CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Optional disabled</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{overview.disabledCount}</CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Bundled modules</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{overview.bundledCount}</CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Roadmap</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="success">{overview.coreCount} core</Badge>
          <Badge variant="warning">{overview.comingSoonCount} soon</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
