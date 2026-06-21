"use client";

import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import { ExternalLink, MoreHorizontal, Tag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { deleteBrandAction, updateBrandStatusAction } from "@/actions/brands/brandMutations";
import { Button } from "@/components/ui/button";
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
import { getSeoScoreColor } from "@/features/dashboard/utils/seoScore";
import { cn } from "@/lib/utils/cn";

import { BrandStatusBadge } from "./BrandStatusBadge";

import type { BrandListItem } from "@/types/brands";

export interface BrandListTableProps {
  readonly items: BrandListItem[];
}

function BrandLogo({ brand }: { brand: BrandListItem }): React.JSX.Element {
  if (!brand.logoUrl) {
    return (
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        <Tag className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={brand.logoUrl}
        alt={brand.name}
        className="h-full w-full object-contain p-0.5"
      />
    </div>
  );
}

function BrandRowActions({ brand }: { brand: BrandListItem }): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const runStatusUpdate = (status: BrandListItem["status"]): void => {
    startTransition(async () => {
      const result = await updateBrandStatusAction({ id: brand.id, status });

      if (result.success) {
        toast.success(`Brand ${status}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const runDelete = (): void => {
    startTransition(async () => {
      const result = await deleteBrandAction(brand.id);

      if (result.success) {
        toast.success("Brand deleted");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Brand actions" disabled={isPending}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/brands/${brand.id}`}>Edit</Link>
        </DropdownMenuItem>
        {brand.status !== "published" ? (
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

export function BrandListTable({ items }: BrandListTableProps): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Brand</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>SEO</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((brand) => {
            const seoColors = brand.seoScore !== null ? getSeoScoreColor(brand.seoScore) : null;

            return (
              <TableRow key={brand.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <BrandLogo brand={brand} />
                    <div className="min-w-0">
                      <Link
                        href={`/admin/brands/${brand.id}`}
                        className="block space-y-0.5 hover:underline"
                      >
                        <span className="font-medium">{brand.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{brand.slug}</span>
                      </Link>
                      {brand.website ? (
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          Website
                        </a>
                      ) : null}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{brand.country ?? "—"}</TableCell>
                <TableCell className="text-sm">{brand.productCount}</TableCell>
                <TableCell>
                  <BrandStatusBadge status={brand.status} />
                </TableCell>
                <TableCell>
                  {brand.seoScore !== null && seoColors ? (
                    <span className={cn("text-sm font-semibold", seoColors.text)}>{brand.seoScore}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(brand.updatedAt, { addSuffix: true, locale: uk })}
                </TableCell>
                <TableCell>
                  <BrandRowActions brand={brand} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
