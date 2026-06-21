import Link from "next/link";
import { AlertTriangle, CheckCircle2, Image as ImageIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatFileSize } from "@/lib/media/format";
import { cn } from "@/lib/utils/cn";

import type { MediaAnalyticsSummary } from "@/types/analytics";

export interface MediaHealthCardProps {
  readonly media: MediaAnalyticsSummary;
}

function MetricRow({
  label,
  value,
  tone = "default",
}: {
  readonly label: string;
  readonly value: string | number;
  readonly tone?: "default" | "warning" | "success";
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-medium",
          tone === "warning" && "text-amber-600 dark:text-amber-400",
          tone === "success" && "text-emerald-600 dark:text-emerald-400",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function MediaHealthCard({ media }: MediaHealthCardProps): React.JSX.Element {
  const altHealth =
    media.totalAssets === 0
      ? 100
      : Math.round(((media.totalAssets - media.missingAlt) / media.totalAssets) * 100);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Media health</CardTitle>
          <CardDescription>Library optimization and accessibility coverage</CardDescription>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
          <ImageIcon className="h-[18px] w-[18px] text-muted-foreground" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-semibold tracking-tight">{altHealth}</p>
            <p className="text-xs text-muted-foreground">ALT coverage score</p>
          </div>
          <Link href="/admin/media" className="text-sm text-primary hover:underline">
            Open library
          </Link>
        </div>

        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <MetricRow label="Total assets" value={media.totalAssets} />
          <MetricRow label="Optimized" value={media.optimizedAssets} tone="success" />
          <MetricRow
            label="Missing ALT"
            value={media.missingAlt}
            tone={media.missingAlt > 0 ? "warning" : "default"}
          />
          <MetricRow label="WebP coverage" value={`${media.webpCoverage}%`} />
          <MetricRow label="AVIF coverage" value={`${media.avifCoverage}%`} />
          <MetricRow label="Storage used" value={formatFileSize(media.totalBytes)} />
        </div>

        {media.missingAlt > 0 ? (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{media.missingAlt} assets are missing Ukrainian or English ALT text.</span>
          </div>
        ) : media.totalAssets > 0 ? (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>All media assets have bilingual ALT text.</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
