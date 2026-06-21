"use client";

import { Loader2, Puzzle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { togglePluginAction } from "@/actions/plugins/togglePlugin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  PLUGIN_AVAILABILITY_LABELS,
  PLUGIN_TYPE_LABELS,
} from "@/constants/plugins";

import type { PluginListItem } from "@/types/plugins";

export interface PluginCardProps {
  readonly plugin: PluginListItem;
}

export function PluginCard({ plugin }: PluginCardProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isToggleDisabled =
    isPending || plugin.isCore || plugin.availability === "coming_soon";

  const handleToggle = (checked: boolean): void => {
    startTransition(async () => {
      const result = await togglePluginAction(plugin.slug, checked);

      if (result.success) {
        toast.success(
          `${plugin.name} ${result.data.enabled ? "enabled" : "disabled"}`,
        );
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
              <Puzzle className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-base">{plugin.name}</CardTitle>
              <CardDescription className="mt-1 text-xs">v{plugin.version}</CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
            ) : null}
            <Switch
              checked={plugin.enabled}
              onCheckedChange={handleToggle}
              disabled={isToggleDisabled}
              aria-label={`Toggle ${plugin.name}`}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{PLUGIN_TYPE_LABELS[plugin.type]}</Badge>
          <Badge variant={plugin.availability === "bundled" ? "secondary" : "warning"}>
            {PLUGIN_AVAILABILITY_LABELS[plugin.availability]}
          </Badge>
          {plugin.isCore ? <Badge variant="success">Core</Badge> : null}
          {plugin.enabled ? <Badge variant="success">Enabled</Badge> : null}
        </div>
      </CardHeader>

      <CardContent className="mt-auto">
        <p className="text-sm text-muted-foreground">{plugin.description}</p>
        {plugin.isCore ? (
          <p className="mt-3 text-xs text-muted-foreground">Core modules stay enabled for platform stability.</p>
        ) : null}
        {plugin.availability === "coming_soon" ? (
          <p className="mt-3 text-xs text-muted-foreground">Available in a future release.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
