"use client";

import { Copy, Loader2, Plus, Webhook } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  createWebhookEndpointAction,
  updateWebhookPolicyAction,
} from "@/actions/api";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PREPARED_WEBHOOK_EVENTS, WEBHOOK_EVENT_LABELS } from "@/constants/api";
import { WebhookDeliveriesTable } from "@/features/api/components/WebhookDeliveriesTable";
import { WebhookEndpointsTable } from "@/features/api/components/WebhookEndpointsTable";

import type { ServerActionResult } from "@/types";
import type { CreateWebhookEndpointResult } from "@/types/webhooks";
import type { WebhookDeliveryListItem, WebhookEndpointListItem } from "@/types/webhooks";

export interface WebhooksPanelProps {
  readonly endpoints: readonly WebhookEndpointListItem[];
  readonly deliveries: readonly WebhookDeliveryListItem[];
  readonly webhookMaxRetries: number;
  readonly webhookRetryBaseDelaySeconds: number;
}

const initialCreateState: ServerActionResult<CreateWebhookEndpointResult> | null = null;
const initialPolicyState: ServerActionResult<{ readonly id: string }> | null = null;

export function WebhooksPanel({
  endpoints,
  deliveries,
  webhookMaxRetries,
  webhookRetryBaseDelaySeconds,
}: WebhooksPanelProps): React.JSX.Element {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [revealedSecret, setRevealedSecret] = useState<CreateWebhookEndpointResult | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<readonly string[]>([
    "product.updated",
  ]);
  const [createState, createAction, isCreatePending] = useActionState(
    createWebhookEndpointAction,
    initialCreateState,
  );
  const [policyState, policyAction, isPolicyPending] = useActionState(
    updateWebhookPolicyAction,
    initialPolicyState,
  );

  useEffect(() => {
    if (!createState) {
      return;
    }

    if (createState.success) {
      setRevealedSecret(createState.data);
      setIsOpen(false);
      router.refresh();
      return;
    }

    toast.error(createState.error);
  }, [createState, router]);

  useEffect(() => {
    if (!policyState) {
      return;
    }

    if (policyState.success) {
      toast.success("Webhook retry policy updated");
      router.refresh();
      return;
    }

    toast.error(policyState.error);
  }, [policyState, router]);

  const toggleEvent = (event: string, checked: boolean): void => {
    setSelectedEvents((current) => {
      if (checked) {
        return current.includes(event) ? current : [...current, event];
      }

      return current.filter((value) => value !== event);
    });
  };

  const copySecret = async (): Promise<void> => {
    if (!revealedSecret) {
      return;
    }

    try {
      await navigator.clipboard.writeText(revealedSecret.plainTextSecret);
      toast.success("Webhook secret copied");
    } catch {
      toast.error("Unable to copy webhook secret");
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Webhooks</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Signed HTTPS deliveries with exponential backoff retries for catalog and system events.
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span className="ml-2">Add endpoint</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Register webhook endpoint</DialogTitle>
                <DialogDescription>
                  Deliveries are signed with HMAC SHA-256. The signing secret is shown once.
                </DialogDescription>
              </DialogHeader>

              <form action={createAction} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="webhook-name">Name</Label>
                  <Input id="webhook-name" name="name" placeholder="Production sync" required maxLength={80} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Endpoint URL</Label>
                  <Input
                    id="webhook-url"
                    name="url"
                    type="url"
                    placeholder="https://integrations.example.com/webhooks/cms"
                    required
                  />
                </div>

                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium">Events</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {PREPARED_WEBHOOK_EVENTS.map((event) => {
                      const checked = selectedEvents.includes(event);

                      return (
                        <label
                          key={event}
                          htmlFor={`event-${event}`}
                          className="flex items-start gap-2 rounded-md border p-3 text-sm"
                        >
                          <Checkbox
                            id={`event-${event}`}
                            name="events"
                            value={event}
                            checked={checked}
                            onCheckedChange={(value) => toggleEvent(event, value === true)}
                          />
                          <span>{WEBHOOK_EVENT_LABELS[event]}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreatePending || selectedEvents.length === 0}>
                    {isCreatePending ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Webhook className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="ml-2">Create endpoint</span>
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="space-y-6">
          <form action={policyAction} className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="webhookMaxRetries">Max retries</Label>
              <Input
                id="webhookMaxRetries"
                name="webhookMaxRetries"
                type="number"
                min={1}
                max={10}
                defaultValue={webhookMaxRetries}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhookRetryBaseDelaySeconds">Base retry delay (seconds)</Label>
              <Input
                id="webhookRetryBaseDelaySeconds"
                name="webhookRetryBaseDelaySeconds"
                type="number"
                min={15}
                max={900}
                defaultValue={webhookRetryBaseDelaySeconds}
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" variant="outline" disabled={isPolicyPending}>
                {isPolicyPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : null}
                <span className="ml-2">Save retry policy</span>
              </Button>
            </div>
          </form>

          {endpoints.length === 0 ? (
            <EmptyState
              title="No webhook endpoints"
              description="Register an HTTPS endpoint to receive signed CMS events."
            />
          ) : (
            <WebhookEndpointsTable items={endpoints} />
          )}

          {deliveries.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Recent deliveries</h3>
              <WebhookDeliveriesTable items={deliveries} />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog
        open={revealedSecret !== null}
        onOpenChange={(open) => !open && setRevealedSecret(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Save your webhook secret</DialogTitle>
            <DialogDescription>
              Use this secret to verify `X-CMS-Signature` on incoming deliveries.
            </DialogDescription>
          </DialogHeader>

          {revealedSecret ? (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="mb-2 text-sm font-medium">{revealedSecret.name}</p>
              <code className="block break-all font-mono text-sm">
                {revealedSecret.plainTextSecret}
              </code>
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={copySecret}>
              <Copy className="h-4 w-4" aria-hidden="true" />
              <span className="ml-2">Copy secret</span>
            </Button>
            <Button type="button" onClick={() => setRevealedSecret(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
