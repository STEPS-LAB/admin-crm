"use client";

import { ChevronDown, ChevronRight, GripVertical, MoreHorizontal, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { reorderCategoriesAction } from "@/actions/catalog/bulk";
import {
  deleteCategoryAction,
  updateCategoryStatusAction,
} from "@/actions/categories/categoryMutations";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSeoScoreColor } from "@/features/dashboard/utils/seoScore";
import { cn } from "@/lib/utils/cn";

import { CategoryBulkToolbar } from "./CategoryBulkToolbar";
import { CategoryCoverThumbnail } from "./CategoryCoverThumbnail";
import { CategoryStatusBadge } from "./CategoryStatusBadge";

import type { CategoryTreeNode } from "@/types/categories";

export interface CategoryTreeViewProps {
  readonly nodes: CategoryTreeNode[];
}

function CategoryNodeActions({ node }: { node: CategoryTreeNode }): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const runStatusUpdate = (status: CategoryTreeNode["status"]): void => {
    startTransition(async () => {
      const result = await updateCategoryStatusAction({ id: node.id, status });

      if (result.success) {
        toast.success(`Category ${status}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const runDelete = (): void => {
    startTransition(async () => {
      const result = await deleteCategoryAction(node.id);

      if (result.success) {
        toast.success("Category deleted");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Category actions" disabled={isPending}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/categories/${node.id}`}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/categories/new?parentId=${node.id}`}>Add child</Link>
        </DropdownMenuItem>
        {node.status !== "published" ? (
          <DropdownMenuItem onClick={() => runStatusUpdate("published")}>Publish</DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => runStatusUpdate("draft")}>Unpublish</DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => runStatusUpdate("archived")}>Archive</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={runDelete}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CategoryTreeNodeRow({
  node,
  depth,
  siblings,
  parentId,
  selectedIds,
  onToggleSelect,
  onReorder,
  isReordering,
}: {
  node: CategoryTreeNode;
  depth: number;
  siblings: CategoryTreeNode[];
  parentId: string | null;
  selectedIds: Set<string>;
  onToggleSelect: (id: string, checked: boolean) => void;
  onReorder: (parentId: string | null, siblings: CategoryTreeNode[], draggedId: string, targetId: string) => void;
  isReordering: boolean;
}): React.JSX.Element {
  const [expanded, setExpanded] = useState(depth < 2);
  const [dragOver, setDragOver] = useState(false);
  const hasChildren = node.children.length > 0;
  const seoColors = node.seoScore !== null ? getSeoScoreColor(node.seoScore) : null;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border border-transparent px-2 py-2 hover:border-border/60 hover:bg-muted/30",
          dragOver && "border-primary/40 bg-primary/5",
        )}
        style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
        draggable={!isReordering}
        onDragStart={(event) => {
          event.dataTransfer.setData("text/category-id", node.id);
          event.dataTransfer.effectAllowed = "move";
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          const draggedId = event.dataTransfer.getData("text/category-id");

          if (draggedId && draggedId !== node.id) {
            onReorder(parentId, siblings, draggedId, node.id);
          }
        }}
      >
        <Checkbox
          checked={selectedIds.has(node.id)}
          onCheckedChange={(value) => onToggleSelect(node.id, value === true)}
          aria-label={`Select ${node.name}`}
        />

        <button
          type="button"
          className="flex h-6 w-6 shrink-0 cursor-grab items-center justify-center rounded-sm text-muted-foreground hover:bg-muted active:cursor-grabbing"
          aria-label={`Drag to reorder ${node.name}`}
          disabled={isReordering}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button
          type="button"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted"
          onClick={() => setExpanded((value) => !value)}
          aria-label={expanded ? "Collapse" : "Expand"}
          disabled={!hasChildren}
        >
          {hasChildren ? (
            expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            <span className="h-4 w-4" />
          )}
        </button>

        <CategoryCoverThumbnail
          name={node.name}
          coverThumbnailUrl={node.coverThumbnailUrl}
          coverAlt={node.coverAlt}
        />

        <div className="min-w-0 flex-1">
          <Link href={`/admin/categories/${node.id}`} className="block hover:underline">
            <span className="font-medium">{node.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{node.slug}</span>
          </Link>
        </div>

        <div className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
          <span>{node.productCount} products</span>
          <span>{node.childrenCount} children</span>
          {node.seoScore !== null && seoColors ? (
            <span className={cn("font-semibold", seoColors.text)}>SEO {node.seoScore}</span>
          ) : null}
        </div>

        <CategoryStatusBadge status={node.status} />
        <CategoryNodeActions node={node} />
      </div>

      {expanded && hasChildren ? (
        <div>
          {node.children.map((child) => (
            <CategoryTreeNodeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              siblings={node.children}
              parentId={node.id}
              selectedIds={selectedIds}
              onToggleSelect={onToggleSelect}
              onReorder={onReorder}
              isReordering={isReordering}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CategoryTreeView({ nodes }: CategoryTreeViewProps): React.JSX.Element {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isReordering, startReorder] = useTransition();

  const selectedSet = new Set(selectedIds);

  const toggleSelect = (id: string, checked: boolean): void => {
    setSelectedIds((current) => {
      if (checked) {
        return current.includes(id) ? current : [...current, id];
      }

      return current.filter((value) => value !== id);
    });
  };

  const handleReorder = (
    parentId: string | null,
    siblings: CategoryTreeNode[],
    draggedId: string,
    targetId: string,
  ): void => {
    const ids = siblings.map((item) => item.id);
    const fromIndex = ids.indexOf(draggedId);
    const toIndex = ids.indexOf(targetId);

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
      return;
    }

    const orderedIds = [...ids];
    orderedIds.splice(fromIndex, 1);
    orderedIds.splice(toIndex, 0, draggedId);

    startReorder(async () => {
      const result = await reorderCategoriesAction({ parentId, orderedIds });

      if (result.success) {
        toast.success("Category order updated");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-3">
      <CategoryBulkToolbar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
      />

      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-medium">Category tree</p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/categories/new">
              <Plus className="mr-2 h-4 w-4" />
              New category
            </Link>
          </Button>
        </div>
        <div className="p-2">
          {nodes.map((node) => (
            <CategoryTreeNodeRow
              key={node.id}
              node={node}
              depth={0}
              siblings={nodes}
              parentId={null}
              selectedIds={selectedSet}
              onToggleSelect={toggleSelect}
              onReorder={handleReorder}
              isReordering={isReordering}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
