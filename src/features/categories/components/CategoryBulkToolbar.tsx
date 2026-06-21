"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import {
  bulkDeleteCategoriesAction,
  bulkUpdateCategoryStatusAction,
} from "@/actions/catalog/bulk";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { CategoryStatus } from "@/constants/categories";

export interface CategoryBulkToolbarProps {
  readonly selectedIds: string[];
  readonly onClearSelection: () => void;
}

export function CategoryBulkToolbar({
  selectedIds,
  onClearSelection,
}: CategoryBulkToolbarProps): React.JSX.Element | null {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (selectedIds.length === 0) {
    return null;
  }

  const runStatusUpdate = (status: CategoryStatus): void => {
    startTransition(async () => {
      const result = await bulkUpdateCategoryStatusAction({ ids: selectedIds, status });

      if (result.success) {
        const failedCount = result.data.failures.length;
        toast.success(
          failedCount > 0
            ? `Updated ${result.data.succeededIds.length} categories (${failedCount} failed)`
            : `Updated ${result.data.succeededIds.length} categories`,
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
      const result = await bulkDeleteCategoriesAction({ ids: selectedIds });

      if (result.success) {
        const failedCount = result.data.failures.length;
        toast.success(
          failedCount > 0
            ? `Deleted ${result.data.succeededIds.length} categories (${failedCount} failed)`
            : `Deleted ${result.data.succeededIds.length} categories`,
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
        {selectedIds.length} categor{selectedIds.length === 1 ? "y" : "ies"} selected
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
