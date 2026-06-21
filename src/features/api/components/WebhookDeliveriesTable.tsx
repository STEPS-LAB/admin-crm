"use client";

import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import { Eye, Loader2, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { getWebhookDeliveryDetailAction } from "@/actions/api/getWebhookDeliveryDetail";
import { replayWebhookDeliveryAction } from "@/actions/api/replayWebhookDelivery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WEBHOOK_EVENT_LABELS } from "@/constants/api";

import type { WebhookDeliveryDetail, WebhookDeliveryListItem } from "@/types/webhooks";

export interface WebhookDeliveriesTableProps {
  readonly items: readonly WebhookDeliveryListItem[];
}

function formatTimestamp(value: Date | null): string {
  if (!value) {
    return "—";
  }

  return formatDistanceToNow(value, { addSuffix: true, locale: uk });
}

function formatJson(value: Record<string, unknown> | string | null): string {
  if (!value) {
    return "—";
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value, null, 2);
}

export function WebhookDeliveriesTable({
  items,
}: WebhookDeliveriesTableProps): React.JSX.Element {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<WebhookDeliveryDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const replayDelivery = (deliveryId: string): void => {
    setPendingId(deliveryId);
    startTransition(async () => {
      const result = await replayWebhookDeliveryAction(deliveryId);

      if (result.success) {
        toast.success("Webhook delivery replayed");
        router.refresh();
      } else {
        toast.error(result.error);
      }

      setPendingId(null);
    });
  };

  const openDetail = (deliveryId: string): void => {
    setDetailId(deliveryId);
    setDetail(null);
    setIsDetailLoading(true);

    startTransition(async () => {
      const result = await getWebhookDeliveryDetailAction(deliveryId);

      if (result.success) {
        setDetail(result.data);
      } else {
        toast.error(result.error);
        setDetailId(null);
      }

      setIsDetailLoading(false);
    });
  };

  const closeDetail = (): void => {
    setDetailId(null);
    setDetail(null);
    setIsDetailLoading(false);
  };

  return (
    <>
      <div className="space-y-2">
        {items.map((delivery) => {
          const canReplay = delivery.status !== "success";
          const isRowPending = isPending && pendingId === delivery.id;

          return (
            <div
              key={delivery.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
            >
              <div className="space-y-1">
                <p className="font-medium">{delivery.endpointName}</p>
                <p className="text-muted-foreground">
                  {WEBHOOK_EVENT_LABELS[delivery.event]} · attempt {delivery.attemptCount}/
                  {delivery.maxAttempts}
                </p>
                {delivery.errorMessage ? (
                  <p className="text-xs text-destructive">{delivery.errorMessage}</p>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    delivery.status === "success"
                      ? "success"
                      : delivery.status === "dead"
                        ? "destructive"
                        : "outline"
                  }
                >
                  {delivery.status}
                </Badge>

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => openDetail(delivery.id)}
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  <span className="ml-2">Details</span>
                </Button>

                {canReplay ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isRowPending}
                    onClick={() => replayDelivery(delivery.id)}
                  >
                    {isRowPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="ml-2">Replay</span>
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={detailId !== null} onOpenChange={(open) => !open && closeDetail()}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Webhook delivery</DialogTitle>
            <DialogDescription>
              {detail
                ? `${detail.endpointName} · ${WEBHOOK_EVENT_LABELS[detail.event]}`
                : "Loading delivery details"}
            </DialogDescription>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : detail ? (
            <div className="space-y-4 text-sm">
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-medium">{detail.status}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Attempts</dt>
                  <dd className="font-medium">
                    {detail.attemptCount}/{detail.maxAttempts}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Response status</dt>
                  <dd className="font-medium">{detail.responseStatus ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd className="font-medium">{formatTimestamp(detail.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Last attempt</dt>
                  <dd className="font-medium">{formatTimestamp(detail.lastAttemptAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Delivered</dt>
                  <dd className="font-medium">{formatTimestamp(detail.deliveredAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Next retry</dt>
                  <dd className="font-medium">{formatTimestamp(detail.nextRetryAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Updated</dt>
                  <dd className="font-medium">{formatTimestamp(detail.updatedAt)}</dd>
                </div>
              </dl>

              {detail.errorMessage ? (
                <div>
                  <p className="mb-1 font-medium text-destructive">Error</p>
                  <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-3 text-xs">
                    {detail.errorMessage}
                  </pre>
                </div>
              ) : null}

              <div>
                <p className="mb-1 font-medium">Payload</p>
                <pre className="max-h-48 overflow-auto rounded-lg border bg-muted/40 p-3 text-xs">
                  {formatJson(detail.payload)}
                </pre>
              </div>

              <div>
                <p className="mb-1 font-medium">Response body</p>
                <pre className="max-h-48 overflow-auto rounded-lg border bg-muted/40 p-3 text-xs">
                  {formatJson(detail.responseBody)}
                </pre>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
