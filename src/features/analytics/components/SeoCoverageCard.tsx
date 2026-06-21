import Link from "next/link";
import { Layers } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { SeoCoverageItem } from "@/types/analytics";

export interface SeoCoverageCardProps {
  readonly items: SeoCoverageItem[];
}

export function SeoCoverageCard({ items }: SeoCoverageCardProps): React.JSX.Element {
  const maxCount = Math.max(...items.map((item) => item.count), 1);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base">SEO coverage</CardTitle>
          <CardDescription>SEO profiles provisioned per entity type</CardDescription>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
          <Layers className="h-[18px] w-[18px] text-muted-foreground" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No SEO profiles yet. Publish content to auto-provision profiles.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.ownerType} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.max((item.count / maxCount) * 100, item.count > 0 ? 8 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <Link href="/admin/seo/profiles" className="text-sm text-primary hover:underline">
          View all SEO profiles
        </Link>
      </CardContent>
    </Card>
  );
}
