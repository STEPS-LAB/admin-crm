"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SEO_OWNER_TYPE_LABELS } from "@/constants/seo";

import type { InternalLinkListItem } from "@/types/seo-templates";

export interface InternalLinkListTableProps {
  readonly items: InternalLinkListItem[];
}

export function InternalLinkListTable({ items }: InternalLinkListTableProps): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Source</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Anchor</TableHead>
            <TableHead className="w-28">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">{item.sourceLabel}</p>
                  <Badge variant="secondary" className="text-[10px] uppercase">
                    {item.sourceLanguage} · {SEO_OWNER_TYPE_LABELS[item.sourceOwnerType]}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p>{item.targetLabel}</p>
                  <p className="text-xs text-muted-foreground">
                    {SEO_OWNER_TYPE_LABELS[item.targetOwnerType]}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{item.anchorText ?? "—"}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" asChild>
                  <Link href={item.sourceHref ?? `/admin/seo/profiles/${item.seoProfileId}`}>Open source</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
