"use client";

import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import { ArrowDown, ArrowUp, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteProductAction,
  duplicateProductAction,
  updateProductStatusAction,
} from "@/actions/products/productMutations";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EntityCoverThumbnail } from "@/features/catalog/components/EntityCoverThumbnail";
import { getSeoScoreColor } from "@/features/dashboard/utils/seoScore";
import { PRODUCT_SORT_FIELD_LABELS, type ProductSortField } from "@/constants/catalog";
import { cn } from "@/lib/utils/cn";

import { ProductBulkToolbar } from "./ProductBulkToolbar";
import { ProductStatusBadge } from "./ProductStatusBadge";

import type { ProductListItem } from "@/types/products";

export interface ProductListTableProps {
  readonly items: ProductListItem[];
}

function ProductRowActions({ product }: { product: ProductListItem }): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const runStatusUpdate = (status: ProductListItem["status"]): void => {
    startTransition(async () => {
      const result = await updateProductStatusAction({ id: product.id, status });

      if (result.success) {
        toast.success(`Product ${status}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const runDuplicate = (): void => {
    startTransition(async () => {
      const result = await duplicateProductAction(product.id);

      if (result.success) {
        toast.success("Product duplicated");
        router.push(`/admin/products/${result.data.id}`);
      } else {
        toast.error(result.error);
      }
    });
  };

  const runDelete = (): void => {
    startTransition(async () => {
      const result = await deleteProductAction(product.id);

      if (result.success) {
        toast.success("Product deleted");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Product actions" disabled={isPending}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/products/${product.id}`}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={runDuplicate}>Duplicate</DropdownMenuItem>
        {product.status !== "published" ? (
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

function SortableHeader({
  field,
  label,
}: {
  field: ProductSortField;
  label: string;
}): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeField = searchParams.get("sortBy") ?? "updatedAt";
  const activeDir = searchParams.get("sortDir") ?? "desc";
  const isActive = activeField === field;

  const toggleSort = (): void => {
    const params = new URLSearchParams(searchParams.toString());
    const nextDir = isActive && activeDir === "asc" ? "desc" : "asc";

    params.set("sortBy", field);
    params.set("sortDir", nextDir);
    params.delete("page");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1 font-medium hover:text-foreground",
        isActive ? "text-foreground" : "text-muted-foreground",
      )}
      onClick={toggleSort}
      disabled={isPending}
      aria-label={`Sort by ${label}`}
    >
      {label}
      {isActive ? (
        activeDir === "asc" ? (
          <ArrowUp className="h-3.5 w-3.5" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5" />
        )
      ) : null}
    </button>
  );
}

export function ProductListTable({ items }: ProductListTableProps): React.JSX.Element {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggleAll = (checked: boolean): void => {
    setSelectedIds(checked ? items.map((item) => item.id) : []);
  };

  const toggleOne = (id: string, checked: boolean): void => {
    setSelectedIds((current) => {
      if (checked) {
        return current.includes(id) ? current : [...current, id];
      }

      return current.filter((value) => value !== id);
    });
  };

  return (
    <div className="space-y-3">
      <ProductBulkToolbar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
      />

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={(value) => toggleAll(value === true)}
                  aria-label="Select all products"
                />
              </TableHead>
              <TableHead>
                <SortableHeader field="name" label={PRODUCT_SORT_FIELD_LABELS.name} />
              </TableHead>
              <TableHead>
                <SortableHeader field="sku" label={PRODUCT_SORT_FIELD_LABELS.sku} />
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>
                <SortableHeader field="price" label={PRODUCT_SORT_FIELD_LABELS.price} />
              </TableHead>
              <TableHead>
                <SortableHeader field="status" label={PRODUCT_SORT_FIELD_LABELS.status} />
              </TableHead>
              <TableHead>SEO</TableHead>
              <TableHead>
                <SortableHeader field="updatedAt" label={PRODUCT_SORT_FIELD_LABELS.updatedAt} />
              </TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((product) => {
              const seoColors = product.seoScore !== null ? getSeoScoreColor(product.seoScore) : null;

              return (
                <TableRow key={product.id} data-state={selectedSet.has(product.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selectedSet.has(product.id)}
                      onCheckedChange={(value) => toggleOne(product.id, value === true)}
                      aria-label={`Select ${product.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <EntityCoverThumbnail
                        name={product.name}
                        coverThumbnailUrl={product.coverThumbnailUrl}
                        coverAlt={product.coverAlt}
                        fallback="product"
                      />
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="block min-w-0 space-y-0.5 hover:underline"
                      >
                        <span className="font-medium">{product.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{product.slug}</span>
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {product.categoryName ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {product.price} {product.currency}
                    </div>
                    {product.oldPrice ? (
                      <div className="text-xs text-muted-foreground line-through">
                        {product.oldPrice} {product.currency}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <ProductStatusBadge status={product.status} />
                  </TableCell>
                  <TableCell>
                    {product.seoScore !== null && seoColors ? (
                      <span className={cn("text-sm font-semibold", seoColors.text)}>{product.seoScore}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(product.updatedAt, { addSuffix: true, locale: uk })}
                  </TableCell>
                  <TableCell>
                    <ProductRowActions product={product} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
