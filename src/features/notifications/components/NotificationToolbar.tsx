"use client";

import { CheckCheck, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import {
  clearReadNotificationsAction,
  markAllNotificationsReadAction,
} from "@/actions/notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { ServerActionResult } from "@/types";

export interface NotificationToolbarProps {
  readonly unreadCount: number;
  readonly criticalCount: number;
}

export function NotificationToolbar({
  unreadCount,
  criticalCount,
}: NotificationToolbarProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const runBulkAction = (
    action: () => Promise<ServerActionResult<{ count: number }>>,
    successMessage: (count: number) => string,
  ): void => {
    startTransition(async () => {
      const result = await action();

      if (result.success) {
        toast.success(successMessage(result.data.count));
        router.refresh();
        return;
      }

      toast.error(result.error);
    });
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Unread</p>
            <p className="text-2xl font-semibold">{unreadCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Critical</p>
            <p className="text-2xl font-semibold text-destructive">{criticalCount}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isPending || unreadCount === 0}
            onClick={() =>
              runBulkAction(markAllNotificationsReadAction, (count) =>
                count > 0 ? `Marked ${count} notification${count === 1 ? "" : "s"} as read` : "No unread notifications",
              )
            }
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() =>
              runBulkAction(clearReadNotificationsAction, (count) =>
                count > 0 ? `Cleared ${count} read notification${count === 1 ? "" : "s"}` : "No read notifications to clear",
              )
            }
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear read
          </Button>

          <Button variant="ghost" size="sm" disabled={isPending} onClick={() => router.refresh()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
