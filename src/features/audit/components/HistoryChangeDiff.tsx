import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface HistoryChangeDiffProps {
  readonly changedFields: string[] | null;
  readonly beforeData: Record<string, unknown> | null;
  readonly afterData: Record<string, unknown> | null;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

export function HistoryChangeDiff({
  changedFields,
  beforeData,
  afterData,
}: HistoryChangeDiffProps): React.JSX.Element {
  const fields = changedFields?.length
    ? changedFields
    : [...new Set([...Object.keys(beforeData ?? {}), ...Object.keys(afterData ?? {})])];

  if (fields.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No field-level diff recorded for this entry.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Changed fields</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field) => (
          <div key={field} className="rounded-lg border border-border/60 p-4">
            <p className="mb-3 text-sm font-medium">{field}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Before</p>
                <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
                  {formatValue(beforeData?.[field])}
                </pre>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">After</p>
                <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
                  {formatValue(afterData?.[field])}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
