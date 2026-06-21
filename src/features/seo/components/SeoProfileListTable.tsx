import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SEO_OWNER_TYPE_LABELS } from "@/constants/seo";
import { getSeoScoreColor } from "@/features/dashboard/utils/seoScore";
import { cn } from "@/lib/utils/cn";

import type { SeoProfileListItem } from "@/types/seo-center";

export interface SeoProfileListTableProps {
  readonly items: SeoProfileListItem[];
}

export function SeoProfileListTable({ items }: SeoProfileListTableProps): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Entity</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Meta title</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Indexable</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((profile) => {
            const colors = profile.overallScore !== null ? getSeoScoreColor(profile.overallScore) : null;

            return (
              <TableRow key={profile.id}>
                <TableCell>
                  <Link href={`/admin/seo/profiles/${profile.id}`} className="font-medium hover:underline">
                    {profile.entityLabel}
                  </Link>
                  {profile.entityHref ? (
                    <Link
                      href={profile.entityHref}
                      className="mt-0.5 block text-xs text-muted-foreground hover:underline"
                    >
                      Open entity
                    </Link>
                  ) : null}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {SEO_OWNER_TYPE_LABELS[profile.ownerType]}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{profile.language.toUpperCase()}</Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                  {profile.metaTitle ?? "—"}
                </TableCell>
                <TableCell>
                  {profile.overallScore !== null && colors ? (
                    <span className={cn("font-semibold", colors.text)}>{profile.overallScore}</span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={profile.isIndexable ? "success" : "secondary"}>
                    {profile.isIndexable ? "Yes" : "No"}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
