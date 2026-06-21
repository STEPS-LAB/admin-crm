"use client";

import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import { FileText, Home, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { deletePageAction, updatePageStatusAction } from "@/actions/pages/pageMutations";
import { Badge } from "@/components/ui/badge";
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
import { PAGE_TYPE_LABELS } from "@/constants/pages";
import { getSeoScoreColor } from "@/features/dashboard/utils/seoScore";
import { cn } from "@/lib/utils/cn";

import { PageStatusBadge } from "./PageStatusBadge";

import type { PageListItem } from "@/types/pages";

export interface PageListTableProps {
  readonly items: PageListItem[];
}

function PageRowActions({ page }: { page: PageListItem }): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const runStatusUpdate = (status: PageListItem["status"]): void => {
    startTransition(async () => {
      const result = await updatePageStatusAction({ id: page.id, status });

      if (result.success) {
        toast.success(`Page ${status}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const runDelete = (): void => {
    startTransition(async () => {
      const result = await deletePageAction(page.id);

      if (result.success) {
        toast.success("Page deleted");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Page actions" disabled={isPending}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/pages/${page.id}`}>Edit</Link>
        </DropdownMenuItem>
        {page.status !== "published" ? (
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

export function PageListTable({ items }: PageListTableProps): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Page</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>SEO</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((page) => {
            const seoColors = page.seoScore !== null ? getSeoScoreColor(page.seoScore) : null;

            return (
              <TableRow key={page.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                      {page.isHomepage ? (
                        <Home className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <FileText className="h-4 w-4" aria-hidden="true" />
                      )}
                    </div>
                    <Link
                      href={`/admin/pages/${page.id}`}
                      className="block min-w-0 space-y-0.5 hover:underline"
                    >
                      <span className="font-medium">{page.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">{page.slug}</span>
                    </Link>
                    {page.isHomepage ? (
                      <Badge variant="outline" className="shrink-0">
                        Homepage
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {PAGE_TYPE_LABELS[page.pageType]}
                </TableCell>
                <TableCell>
                  <PageStatusBadge status={page.status} />
                </TableCell>
                <TableCell>
                  {page.seoScore !== null && seoColors ? (
                    <span className={cn("text-sm font-semibold", seoColors.text)}>{page.seoScore}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(page.updatedAt, { addSuffix: true, locale: uk })}
                </TableCell>
                <TableCell>
                  <PageRowActions page={page} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
