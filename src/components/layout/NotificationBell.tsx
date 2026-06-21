import Link from "next/link";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface NotificationBellProps {
  readonly unreadCount: number;
}

export function NotificationBell({ unreadCount }: NotificationBellProps): React.JSX.Element {
  const label =
    unreadCount > 0
      ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
      : "Notifications";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      asChild
      aria-label={label}
    >
      <Link href="/admin/notifications">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span
            className={cn(
              "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground",
            )}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
