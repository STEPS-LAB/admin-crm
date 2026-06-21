"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { toggleFeatureFlagAction } from "@/actions/feature-flags/toggleFeatureFlag";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { FEATURE_FLAG_AVAILABILITY_LABELS } from "@/constants/feature-flags";

import type { FeatureFlagListItem } from "@/types/feature-flags";

export interface FeatureFlagCardProps {
  readonly flag: FeatureFlagListItem;
}

export function FeatureFlagCard({ flag }: FeatureFlagCardProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isToggleDisabled = isPending || flag.availability === "coming_soon";

  const handleToggle = (checked: boolean): void => {
    startTransition(async () => {
      const result = await toggleFeatureFlagAction(flag.slug, checked);

      if (result.success) {
        toast.success(`${flag.name} ${result.data.enabled ? "enabled" : "disabled"}`);
        router.refresh();
        return;
      }

      toast.error(result.error);
    });
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-lg border bg-muted/40 p-2">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-base">{flag.name}</CardTitle>
              <CardDescription className="mt-1 text-xs">{flag.environment} environment</CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
            ) : null}
            <Switch
              checked={flag.enabled}
              onCheckedChange={handleToggle}
              disabled={isToggleDisabled}
              aria-label={`Toggle ${flag.name}`}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant={flag.availability === "bundled" ? "secondary" : "warning"}>
            {FEATURE_FLAG_AVAILABILITY_LABELS[flag.availability]}
          </Badge>
          {flag.enabled ? <Badge variant="success">Enabled</Badge> : null}
        </div>
      </CardHeader>

      <CardContent className="mt-auto">
        <p className="text-sm text-muted-foreground">{flag.description}</p>
        {flag.availability === "coming_soon" ? (
          <p className="mt-3 text-xs text-muted-foreground">Available in a future release.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
