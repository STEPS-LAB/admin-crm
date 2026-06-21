import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AUDIT_ACTION_LABELS } from "@/constants/audit";

import type { SecurityAuditListItem } from "@/types/audit";

export interface SecurityAuditTableProps {
  readonly items: SecurityAuditListItem[];
}

export function SecurityAuditTable({ items }: SecurityAuditTableProps): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>IP address</TableHead>
            <TableHead>When</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Badge variant={item.action === "FAILED_LOGIN" ? "destructive" : "secondary"}>
                  {AUDIT_ACTION_LABELS[item.action] ?? item.action}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">{item.actorName ?? "Unknown"}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {item.ipAddress ?? "—"}
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
