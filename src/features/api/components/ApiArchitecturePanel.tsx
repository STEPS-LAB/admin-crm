import { ArrowDown } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_ARCHITECTURE_LAYERS } from "@/constants/api";

export function ApiArchitecturePanel(): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Internal architecture</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          The CMS uses type-safe Server Actions today. Business logic stays in services and
          repositories so a future public REST layer can be added without refactoring.
        </p>

        <div className="flex flex-col items-start gap-2">
          {API_ARCHITECTURE_LAYERS.map((layer, index) => (
            <div key={layer} className="flex items-center gap-2">
              <span className="rounded-md border bg-muted/40 px-3 py-1.5 text-sm font-medium">
                {layer}
              </span>
              {index < API_ARCHITECTURE_LAYERS.length - 1 ? (
                <ArrowDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
