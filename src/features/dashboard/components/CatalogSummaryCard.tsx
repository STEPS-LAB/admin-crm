import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { DashboardSummary } from "@/types/dashboard";

export interface CatalogSummaryCardProps {
  readonly summary: DashboardSummary;
}

export function CatalogSummaryCard({ summary }: CatalogSummaryCardProps): React.JSX.Element {
  const { products, categories } = summary;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Catalog summary</CardTitle>
        <CardDescription>Published catalog footprint and distribution</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Total products</p>
          <p className="text-xl font-semibold">{products.total}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Published</p>
          <p className="text-xl font-semibold">{products.published}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Draft</p>
          <p className="text-xl font-semibold">{products.draft}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Categories</p>
          <p className="text-xl font-semibold">{categories.total}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Brands</p>
          <p className="text-xl font-semibold">{categories.brands}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Archived / hidden</p>
          <p className="text-xl font-semibold">{products.archived + products.hidden}</p>
        </div>
      </CardContent>
    </Card>
  );
}
