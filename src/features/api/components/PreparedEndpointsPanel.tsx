import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { API_SCOPE_LABELS, PREPARED_API_ENDPOINTS } from "@/constants/api";

export function PreparedEndpointsPanel(): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle>Prepared public endpoints</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/api/docs">OpenAPI docs</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Versioned REST routes for headless integrations. Active endpoints require a bearer API key
          with the matching scope.
        </p>

        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PREPARED_API_ENDPOINTS.map((endpoint) => (
                <TableRow key={`${endpoint.method}-${endpoint.path}`}>
                  <TableCell>
                    <Badge variant="outline">{endpoint.method}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{endpoint.path}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {endpoint.description}
                  </TableCell>
                  <TableCell className="text-xs">
                    {endpoint.scope ? API_SCOPE_LABELS[endpoint.scope] : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={endpoint.status === "active" ? "success" : "warning"}>
                      {endpoint.status === "active" ? "Active" : "Prepared"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
