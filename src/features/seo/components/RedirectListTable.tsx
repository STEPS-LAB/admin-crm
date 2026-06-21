"use client";

import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { deleteRedirectAction } from "@/actions/seo/deleteRedirect";
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

import type { RedirectListItem } from "@/types/seo-center";

export interface RedirectListTableProps {
  readonly items: RedirectListItem[];
}

function RedirectRowActions({ redirect }: { redirect: RedirectListItem }): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const runDelete = (): void => {
    startTransition(async () => {
      const result = await deleteRedirectAction(redirect.id);

      if (result.success) {
        toast.success("Redirect deleted");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Redirect actions" disabled={isPending}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/seo/redirects/${redirect.id}`}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={runDelete}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function RedirectListTable({ items }: RedirectListTableProps): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Source</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Hits</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((redirect) => (
            <TableRow key={redirect.id}>
              <TableCell>
                <Link href={`/admin/seo/redirects/${redirect.id}`} className="font-mono text-sm hover:underline">
                  {redirect.source}
                </Link>
              </TableCell>
              <TableCell className="max-w-xs truncate font-mono text-sm text-muted-foreground">
                {redirect.destination}
              </TableCell>
              <TableCell>
                <Badge variant={redirect.enabled ? "success" : "secondary"}>
                  {redirect.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </TableCell>
              <TableCell>{redirect.statusCode}</TableCell>
              <TableCell>{redirect.hits}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(redirect.updatedAt, { addSuffix: true, locale: uk })}
              </TableCell>
              <TableCell>
                <RedirectRowActions redirect={redirect} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
