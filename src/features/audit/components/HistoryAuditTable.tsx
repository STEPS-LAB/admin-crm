import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HISTORY_ENTITY_LABELS, HISTORY_OPERATION_LABELS } from "@/constants/audit";

import type { HistoryAuditListItem } from "@/types/audit";

export interface HistoryAuditTableProps {
  readonly items: HistoryAuditListItem[];
}

export function HistoryAuditTable({ items }: HistoryAuditTableProps): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Summary</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Operation</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>When</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Link href={`/admin/audit/changes/${item.id}`} className="font-medium hover:underline">
                  {item.changeSummary}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{HISTORY_ENTITY_LABELS[item.entityType] ?? item.entityType}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {HISTORY_OPERATION_LABELS[item.operation] ?? item.operation}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {item.isSystemAction ? "System" : (item.actorName ?? "Unknown")}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(item.createdAt, { addSuffix: true, locale: uk })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
