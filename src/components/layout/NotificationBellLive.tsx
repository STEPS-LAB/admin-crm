"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getNotificationSummaryAction } from "@/actions/notifications";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

export interface NotificationBellLiveProps {
  readonly userId: string;
}

const POLL_INTERVAL_MS = 45_000;

export function NotificationBellLive({
  userId,
}: NotificationBellLiveProps): React.JSX.Element {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    void getNotificationSummaryAction().then((summary) => {
      setUnreadCount(summary.unreadCount);
    });
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `profile_id=eq.${userId}`,
        },
        () => {
          void getNotificationSummaryAction().then((summary) => {
            setUnreadCount(summary.unreadCount);
          });
          router.refresh();
        },
      )
      .subscribe();

    const pollId = window.setInterval(() => {
      void getNotificationSummaryAction().then((summary) => {
        setUnreadCount(summary.unreadCount);
      });
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(pollId);
      void supabase.removeChannel(channel);
    };
  }, [router, userId]);

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
