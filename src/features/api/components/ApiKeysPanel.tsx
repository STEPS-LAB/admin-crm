"use client";

import { Copy, KeyRound, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { createApiKeyAction } from "@/actions/api/createApiKey";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Badge } from "@/components/ui/badge";
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
import { API_SCOPES, API_SCOPE_LABELS } from "@/constants/api";
import { ApiKeysTable } from "@/features/api/components/ApiKeysTable";

import type { ServerActionResult } from "@/types";
import type { ApiKeyListItem, CreateApiKeyResult } from "@/types/api";

export interface ApiKeysPanelProps {
  readonly items: readonly ApiKeyListItem[];
}

const initialState: ServerActionResult<CreateApiKeyResult> | null = null;

export function ApiKeysPanel({ items }: ApiKeysPanelProps): React.JSX.Element {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [revealedKey, setRevealedKey] = useState<CreateApiKeyResult | null>(null);
  const [selectedScopes, setSelectedScopes] = useState<readonly string[]>(["read:products"]);
  const [state, formAction, isPending] = useActionState(createApiKeyAction, initialState);

  useEffect(() => {
    if (!state) {
      return;
    }

    if (state.success) {
      setRevealedKey(state.data);
      setIsOpen(false);
      router.refresh();
      return;
    }

    toast.error(state.error);
  }, [state, router]);

  const toggleScope = (scope: string, checked: boolean): void => {
    setSelectedScopes((current) => {
      if (checked) {
        return current.includes(scope) ? current : [...current, scope];
      }

      return current.filter((value) => value !== scope);
    });
  };

  const copyRevealedKey = async (): Promise<void> => {
    if (!revealedKey) {
      return;
    }

    try {
      await navigator.clipboard.writeText(revealedKey.plainTextKey);
      toast.success("API key copied to clipboard");
    } catch {
      toast.error("Unable to copy API key");
    }
  };

  const closeRevealDialog = (): void => {
    setRevealedKey(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>API keys</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Scoped tokens for future headless integrations. Keys are shown once on creation.
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span className="ml-2">Create key</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create API key</DialogTitle>
                <DialogDescription>
                  Choose a descriptive name and the scopes this integration needs.
                </DialogDescription>
              </DialogHeader>

              <form action={formAction} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="api-key-name">Name</Label>
                  <Input
                    id="api-key-name"
                    name="name"
                    placeholder="Production storefront"
                    required
                    maxLength={80}
                  />
                </div>

                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium">Scopes</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {API_SCOPES.map((scope) => {
                      const checked = selectedScopes.includes(scope);

                      return (
                        <label
                          key={scope}
                          htmlFor={`scope-${scope}`}
                          className="flex items-start gap-2 rounded-md border p-3 text-sm"
                        >
                          <Checkbox
                            id={`scope-${scope}`}
                            name="scopes"
                            value={scope}
                            checked={checked}
                            onCheckedChange={(value) => toggleScope(scope, value === true)}
                          />
                          <span>{API_SCOPE_LABELS[scope]}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="space-y-2">
                  <Label htmlFor="api-key-expires">Expires at (optional)</Label>
                  <Input id="api-key-expires" name="expiresAt" type="datetime-local" />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending || selectedScopes.length === 0}>
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <KeyRound className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="ml-2">Generate key</span>
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {items.length === 0 ? (
            <EmptyState
              title="No API keys yet"
              description="Create a scoped key when you are ready to connect external services."
            />
          ) : (
            <ApiKeysTable items={items} />
          )}
        </CardContent>
      </Card>

      <Dialog open={revealedKey !== null} onOpenChange={(open) => !open && closeRevealDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Save your API key</DialogTitle>
            <DialogDescription>
              This is the only time the full key will be shown. Store it securely before closing.
            </DialogDescription>
          </DialogHeader>

          {revealedKey ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="mb-2 text-sm font-medium">{revealedKey.name}</p>
                <code className="block break-all font-mono text-sm">{revealedKey.plainTextKey}</code>
              </div>

              <div className="flex flex-wrap gap-2">
                {revealedKey.scopes.map((scope) => (
                  <Badge key={scope} variant="outline">
                    {API_SCOPE_LABELS[scope]}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={copyRevealedKey}>
              <Copy className="h-4 w-4" aria-hidden="true" />
              <span className="ml-2">Copy key</span>
            </Button>
            <Button type="button" onClick={closeRevealDialog}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
