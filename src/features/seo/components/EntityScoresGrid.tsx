import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSeoScoreColor } from "@/features/dashboard/utils/seoScore";
import { cn } from "@/lib/utils/cn";

import type { SeoEntityScore } from "@/types/seo-center";

export interface EntityScoresGridProps {
  readonly entities: SeoEntityScore[];
}

export function EntityScoresGrid({ entities }: EntityScoresGridProps): React.JSX.Element {
  if (entities.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No analyzed SEO profiles yet. Run analysis after creating entity profiles.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {entities.map((entity) => {
        const colors = getSeoScoreColor(entity.averageScore);

        return (
          <Card key={entity.ownerType}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{entity.label}</CardTitle>
              <CardDescription>{entity.profileCount} profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={cn("text-2xl font-semibold", colors.text)}>{entity.averageScore}</p>
              <Link
                href={`/admin/seo/profiles?ownerType=${entity.ownerType}`}
                className="mt-2 inline-block text-xs text-primary hover:underline"
              >
                View profiles
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
