import { cn } from "@/lib/utils/cn";

import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface DataTableShellProps {
  readonly isLoading?: boolean;
  readonly isEmpty?: boolean;
  readonly emptyTitle?: string;
  readonly emptyDescription?: string;
  readonly columns: string[];
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function DataTableShell({
  isLoading = false,
  isEmpty = false,
  emptyTitle = "No data yet",
  emptyDescription = "Items will appear here once created.",
  columns,
  children,
  className,
}: DataTableShellProps): React.JSX.Element {
  if (isEmpty && !isLoading) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        {...(className ? { className } : {})}
      />
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, rowIndex) => (
                  <TableRow key={`skeleton-row-${rowIndex}`}>
                    {columns.map((column) => (
                      <TableCell key={`${column}-${rowIndex}`}>
                        <div className="h-4 w-full max-w-[12rem] animate-pulse rounded bg-muted" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : children}
          </TableBody>
        </Table>
        {isLoading ? (
          <div className="sr-only">
            <LoadingState label="Loading table data" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
