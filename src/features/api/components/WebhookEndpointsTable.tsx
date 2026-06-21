"use client";

import { Loader2, Power, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteWebhookEndpointAction,
  setWebhookEndpointStatusAction,
} from "@/actions/api/webhooks";
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
import { WEBHOOK_EVENT_LABELS } from "@/constants/api";

import type { WebhookEndpointListItem } from "@/types/webhooks";

export interface WebhookEndpointsTableProps {
  readonly items: readonly WebhookEndpointListItem[];
}

export function WebhookEndpointsTable({ items }: WebhookEndpointsTableProps): React.JSX.Element {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const runAction = (
    endpointId: string,
    action: () => Promise<{ success: boolean; error?: string }>,
  ): void => {
    setPendingId(endpointId);
    startTransition(async () => {
      const result = await action();

      if (result.success) {
        toast.success("Webhook endpoint updated");
        router.refresh();
      } else {
        toast.error(result.error ?? "Webhook action failed");
      }

      setPendingId(null);
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>URL</TableHead>
          <TableHead>Events</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const isRowPending = isPending && pendingId === item.id;

          return (
            <TableRow key={item.id}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{item.secretPrefix}…</p>
                </div>
              </TableCell>
              <TableCell className="max-w-[240px] truncate">{item.url}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {item.events.map((event) => (
                    <Badge key={event} variant="outline">
                      {WEBHOOK_EVENT_LABELS[event]}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={item.status === "active" ? "success" : "secondary"}>
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isRowPending}
                    onClick={() =>
                      runAction(item.id, () =>
                        setWebhookEndpointStatusAction(
                          item.id,
                          item.status === "active" ? "disabled" : "active",
                        ),
                      )
                    }
                  >
                    {isRowPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Power className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="sr-only">Toggle webhook endpoint</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isRowPending}
                    onClick={() =>
                      runAction(item.id, () => deleteWebhookEndpointAction(item.id))
                    }
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Delete webhook endpoint</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
