"use client";

import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { deleteSeoTemplateAction } from "@/actions/seo/seoTemplateActions";
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
import { SEO_TEMPLATE_OWNER_TYPE_LABELS } from "@/constants/seo-templates";

import type { SeoTemplateListItem } from "@/types/seo-templates";

export interface SeoTemplateListTableProps {
  readonly items: SeoTemplateListItem[];
}

function TemplateRowActions({ template }: { template: SeoTemplateListItem }): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const runDelete = (): void => {
    startTransition(async () => {
      const result = await deleteSeoTemplateAction(template.id);

      if (result.success) {
        toast.success("Template deleted");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Template actions" disabled={isPending}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/seo/templates/${template.id}`}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={runDelete}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SeoTemplateListTable({ items }: SeoTemplateListTableProps): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Entity type</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Default</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((template) => (
            <TableRow key={template.id}>
              <TableCell>
                <Link href={`/admin/seo/templates/${template.id}`} className="font-medium hover:underline">
                  {template.name}
                </Link>
              </TableCell>
              <TableCell>{SEO_TEMPLATE_OWNER_TYPE_LABELS[template.ownerType]}</TableCell>
              <TableCell className="uppercase">{template.language}</TableCell>
              <TableCell>
                {template.isDefault ? <Badge variant="success">Default</Badge> : "—"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(template.updatedAt, { addSuffix: true, locale: uk })}
              </TableCell>
              <TableCell>
                <TemplateRowActions template={template} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
