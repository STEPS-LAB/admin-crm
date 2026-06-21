"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import {
  bulkDeleteProductsAction,
  bulkUpdateProductStatusAction,
} from "@/actions/catalog/bulk";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { ProductStatus } from "@/constants/products";

export interface ProductBulkToolbarProps {
  readonly selectedIds: string[];
  readonly onClearSelection: () => void;
}

export function ProductBulkToolbar({
  selectedIds,
  onClearSelection,
}: ProductBulkToolbarProps): React.JSX.Element | null {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (selectedIds.length === 0) {
    return null;
  }

  const runStatusUpdate = (status: ProductStatus): void => {
    startTransition(async () => {
      const result = await bulkUpdateProductStatusAction({ ids: selectedIds, status });

      if (result.success) {
        const failedCount = result.data.failures.length;
        toast.success(
          failedCount > 0
            ? `Updated ${result.data.succeededIds.length} products (${failedCount} failed)`
            : `Updated ${result.data.succeededIds.length} products`,
        );
        onClearSelection();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const runDelete = (): void => {
    startTransition(async () => {
      const result = await bulkDeleteProductsAction({ ids: selectedIds });

      if (result.success) {
        const failedCount = result.data.failures.length;
        toast.success(
          failedCount > 0
            ? `Deleted ${result.data.succeededIds.length} products (${failedCount} failed)`
            : `Deleted ${result.data.succeededIds.length} products`,
        );
        onClearSelection();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 px-4 py-3">
      <p className="text-sm font-medium">
        {selectedIds.length} product{selectedIds.length === 1 ? "" : "s"} selected
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={onClearSelection} disabled={isPending}>
          Clear
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isPending}>
              Change status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => runStatusUpdate("published")}>Publish</DropdownMenuItem>
            <DropdownMenuItem onClick={() => runStatusUpdate("draft")}>Unpublish</DropdownMenuItem>
            <DropdownMenuItem onClick={() => runStatusUpdate("archived")}>Archive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="destructive" size="sm" onClick={runDelete} disabled={isPending}>
          Delete
        </Button>
      </div>
    </div>
  );
}
