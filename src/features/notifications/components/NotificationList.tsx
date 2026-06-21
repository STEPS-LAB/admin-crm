"use client";

import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Info,
  Search,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import {
  dismissNotificationAction,
  markNotificationReadAction,
} from "@/actions/notifications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NOTIFICATION_TYPE_LABELS } from "@/constants/notifications";
import {
  getNotificationPriorityLabel,
  getNotificationVisualStyle,
} from "@/features/notifications/utils/notificationVisuals";
import { cn } from "@/lib/utils/cn";

import type { NotificationType } from "@/constants/notifications";
import type { ServerActionResult } from "@/types";
import type { NotificationListItem } from "@/types/notifications";

const NOTIFICATION_ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  seo: Search,
  system: Settings,
};

export interface NotificationListProps {
  readonly items: NotificationListItem[];
}

function NotificationCard({ item }: { readonly item: NotificationListItem }): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const Icon = NOTIFICATION_ICONS[item.type];
  const visual = getNotificationVisualStyle(item.type);

  const runAction = (action: () => Promise<ServerActionResult<{ id: string }>>): void => {
    startTransition(async () => {
      const result = await action();

      if (result.success) {
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const markRead = (): void => {
    runAction(() => markNotificationReadAction(item.id));
  };

  const dismiss = (): void => {
    runAction(() => dismissNotificationAction(item.id));
  };

  return (
    <Card
      className={cn(
        "border-l-4 transition-colors",
        visual.accentClass,
        !item.isRead && "bg-accent/20",
      )}
    >
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted"
            aria-hidden
          >
            <Icon className="h-4 w-4" />
          </div>

          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={cn("text-sm font-medium", !item.isRead && "text-foreground")}>
                {item.title}
              </h3>
              {!item.isRead ? <Badge variant="default">Unread</Badge> : null}
              <Badge variant={visual.badgeVariant}>{NOTIFICATION_TYPE_LABELS[item.type]}</Badge>
              <Badge variant="outline">{getNotificationPriorityLabel(item.type, item.metadata)}</Badge>
            </div>

            <p className="text-sm text-muted-foreground">{item.message}</p>

            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(item.createdAt, { addSuffix: true, locale: uk })}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {item.link ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={item.link}>
                Open
                <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : null}

          {!item.isRead ? (
            <Button variant="outline" size="sm" onClick={markRead} disabled={isPending}>
              Mark read
            </Button>
          ) : null}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={dismiss}
            disabled={isPending}
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function NotificationList({ items }: NotificationListProps): React.JSX.Element {
  return (
    <div className="space-y-3" role="list" aria-label="Notifications">
      {items.map((item) => (
        <div key={item.id} role="listitem">
          <NotificationCard item={item} />
        </div>
      ))}
    </div>
  );
}
