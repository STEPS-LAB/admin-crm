import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { ContentQualitySummary } from "@/types/dashboard";

export interface ContentQualityWidgetProps {
  readonly quality: ContentQualitySummary;
}

const ROWS = [
  { key: "withoutSeoProfile", label: "Products without SEO profile", filter: "no-seo" },
  { key: "withoutShortDescription", label: "Products without short description", filter: "no-short-desc" },
  { key: "withoutDescription", label: "Products without full description", filter: "no-desc" },
] as const;

export function ContentQualityWidget({ quality }: ContentQualityWidgetProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Content quality</CardTitle>
        <CardDescription>Catalog items that need attention</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {ROWS.map((row) => {
          const count = quality[row.key];

          return (
            <Link
              key={row.key}
              href={`/admin/products?filter=${row.filter}`}
              className="flex items-center justify-between rounded-md border border-border/60 px-4 py-3 text-sm transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>{row.label}</span>
              <span className="font-semibold">{count}</span>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
