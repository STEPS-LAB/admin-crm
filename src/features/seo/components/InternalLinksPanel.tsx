"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createInternalLinkAction,
  deleteInternalLinkAction,
  searchInternalLinkTargetsAction,
} from "@/actions/seo/internalLinkActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SEO_OWNER_TYPE_LABELS } from "@/constants/seo";

import type { InternalLinkListItem, InternalLinkTargetOption } from "@/types/seo-templates";

export interface InternalLinksPanelProps {
  readonly seoProfileId: string;
  readonly initialLinks: InternalLinkListItem[];
}

export function InternalLinksPanel({
  seoProfileId,
  initialLinks,
}: InternalLinksPanelProps): React.JSX.Element {
  const router = useRouter();
  const [links, setLinks] = useState(initialLinks);
  const [search, setSearch] = useState("");
  const [targets, setTargets] = useState<InternalLinkTargetOption[]>([]);
  const [selectedTarget, setSelectedTarget] = useState("");
  const [anchorText, setAnchorText] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks]);

  useEffect(() => {
    if (search.trim().length < 2) {
      setTargets([]);
      return;
    }

    const timeout = setTimeout(() => {
      void searchInternalLinkTargetsAction(search).then(setTargets);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const runCreate = (): void => {
    const target = targets.find((item) => `${item.ownerType}:${item.ownerId}` === selectedTarget);

    if (!target) {
      toast.error("Select a target entity");
      return;
    }

    startTransition(async () => {
      const result = await createInternalLinkAction({
        seoProfileId,
        targetOwnerType: target.ownerType,
        targetOwnerId: target.ownerId,
        anchorText: anchorText.trim() || null,
      });

      if (result.success) {
        toast.success("Internal link added");
        setSearch("");
        setSelectedTarget("");
        setAnchorText("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const runDelete = (id: string): void => {
    startTransition(async () => {
      const result = await deleteInternalLinkAction(id);

      if (result.success) {
        toast.success("Internal link removed");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Internal links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {links.length === 0 ? (
          <p className="text-sm text-muted-foreground">No manual internal links yet.</p>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium">{link.anchorText ?? link.targetLabel}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {SEO_OWNER_TYPE_LABELS[link.targetOwnerType]} · {link.targetLabel}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {link.targetHref ? (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={link.targetHref}>Open</Link>
                    </Button>
                  ) : null}
                  <Button variant="ghost" size="sm" onClick={() => runDelete(link.id)} disabled={isPending}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
          <p className="text-sm font-medium">Add manual link</p>
          <Input
            placeholder="Search products, categories, pages, brands…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search link targets"
          />
          <Select value={selectedTarget} onValueChange={setSelectedTarget}>
            <SelectTrigger aria-label="Select link target">
              <SelectValue placeholder="Select target" />
            </SelectTrigger>
            <SelectContent>
              {targets.map((target) => (
                <SelectItem key={`${target.ownerType}:${target.ownerId}`} value={`${target.ownerType}:${target.ownerId}`}>
                  {SEO_OWNER_TYPE_LABELS[target.ownerType]} · {target.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Anchor text (optional)"
            value={anchorText}
            onChange={(event) => setAnchorText(event.target.value)}
            aria-label="Anchor text"
          />
          <Button onClick={runCreate} disabled={isPending || !selectedTarget}>
            Add link
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
