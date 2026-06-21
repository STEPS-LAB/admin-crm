"use client";

import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import { Ban, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { revokeApiKeyAction } from "@/actions/api/revokeApiKey";
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
import { API_KEY_STATUS_LABELS, API_SCOPE_LABELS } from "@/constants/api";
import { maskApiKey } from "@/lib/api/maskApiKey";

import type { ApiKeyListItem } from "@/types/api";

export interface ApiKeysTableProps {
  readonly items: readonly ApiKeyListItem[];
}

export function ApiKeysTable({ items }: ApiKeysTableProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const handleRevoke = (id: string): void => {
    if (confirmingId !== id) {
      setConfirmingId(id);
      return;
    }

    setPendingId(id);
    startTransition(async () => {
      const result = await revokeApiKeyAction(id);

      if (result.success) {
        toast.success(`API key "${result.data.name}" revoked`);
        setConfirmingId(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }

      setPendingId(null);
    });
  };

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Scopes</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const isRevoking = isPending && pendingId === item.id;
            const isConfirming = confirmingId === item.id;

            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {maskApiKey(item.keyPrefix)}
                </TableCell>
                <TableCell>
                  <div className="flex max-w-xs flex-wrap gap-1">
                    {item.scopes.map((scope) => (
                      <Badge key={scope} variant="outline" className="text-[10px]">
                        {API_SCOPE_LABELS[scope]}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={item.status === "active" ? "success" : "secondary"}>
                    {API_KEY_STATUS_LABELS[item.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(item.createdAt, { addSuffix: true, locale: uk })}
                </TableCell>
                <TableCell className="text-right">
                  {item.status === "active" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant={isConfirming ? "destructive" : "outline"}
                      disabled={isRevoking}
                      onClick={() => handleRevoke(item.id)}
                      aria-label={
                        isConfirming
                          ? `Confirm revoke ${item.name}`
                          : `Revoke API key ${item.name}`
                      }
                    >
                      {isRevoking ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Ban className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span className="ml-2">{isConfirming ? "Confirm revoke" : "Revoke"}</span>
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
