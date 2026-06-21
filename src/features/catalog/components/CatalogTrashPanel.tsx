"use client";

import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { restoreCatalogEntityAction } from "@/actions/catalog/trash";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CATALOG_TRASH_ENTITY_LABELS } from "@/constants/catalog";

import type { CatalogTrashListItem } from "@/types/catalog-trash";

export interface CatalogTrashPanelProps {
  readonly items: CatalogTrashListItem[];
}

export function CatalogTrashPanel({ items }: CatalogTrashPanelProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const runRestore = (item: CatalogTrashListItem): void => {
    startTransition(async () => {
      const result = await restoreCatalogEntityAction({
        entityType: item.entityType,
        id: item.id,
      });

      if (result.success) {
        toast.success(`Restored ${item.label}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Deleted</TableHead>
            <TableHead className="w-28">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={`${item.entityType}-${item.id}`}>
              <TableCell className="text-sm text-muted-foreground">
                {CATALOG_TRASH_ENTITY_LABELS[item.entityType]}
              </TableCell>
              <TableCell className="font-medium">{item.label}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {item.secondaryLabel ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(item.deletedAt, { addSuffix: true, locale: uk })}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => runRestore(item)}
                  disabled={isPending}
                >
                  Restore
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
