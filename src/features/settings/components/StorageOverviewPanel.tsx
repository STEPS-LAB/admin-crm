import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STORAGE_PROVIDER_LABELS } from "@/constants/storage-settings";
import { formatFileSize } from "@/lib/media/format";

import type { StorageOverview } from "@/services/storageOverviewService";

export interface StorageOverviewPanelProps {
  readonly overview: StorageOverview;
}

export function StorageOverviewPanel({ overview }: StorageOverviewPanelProps): React.JSX.Element {
  const optimizationRate =
    overview.totalAssets > 0
      ? Math.round((overview.optimizedAssets / overview.totalAssets) * 100)
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Storage overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {STORAGE_PROVIDER_LABELS[overview.provider as keyof typeof STORAGE_PROVIDER_LABELS] ??
              overview.provider}
          </Badge>
          <Badge variant="secondary">{overview.defaultBucket}</Badge>
          <Badge variant="outline">Max upload {overview.maxUploadSizeMb} MB</Badge>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Total assets</dt>
            <dd className="font-medium">{overview.totalAssets.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Total storage</dt>
            <dd className="font-medium">{formatFileSize(overview.totalBytes)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Optimized assets</dt>
            <dd className="font-medium">
              {overview.optimizedAssets.toLocaleString()} ({optimizationRate}%)
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
