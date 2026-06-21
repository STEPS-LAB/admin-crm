import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import { LogIn, LogOut, ShieldAlert, UserCog } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

import type { ActivityFeedItem } from "@/types/dashboard";

export interface RecentActivityFeedProps {
  readonly items: ActivityFeedItem[];
}

function getActivityMeta(action: string): { label: string; icon: typeof LogIn; className: string } {
  switch (action) {
    case "LOGIN":
      return { label: "Signed in", icon: LogIn, className: "text-green-600" };
    case "LOGOUT":
      return { label: "Signed out", icon: LogOut, className: "text-muted-foreground" };
    case "FAILED_LOGIN":
      return { label: "Failed login attempt", icon: ShieldAlert, className: "text-destructive" };
    case "PROFILE_UPDATED":
      return { label: "Profile updated", icon: UserCog, className: "text-primary" };
    default:
      return { label: action, icon: LogIn, className: "text-muted-foreground" };
  }
}

export function RecentActivityFeed({ items }: RecentActivityFeedProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">Recent activity</CardTitle>
          <CardDescription>Latest administrator and security events</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="shrink-0" asChild>
          <Link href="/admin/audit/security">View audit log</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            title="No activity yet"
            description="Authentication and content events will appear here."
            className="py-10"
          />
        ) : (
          <ol className="space-y-4">
            {items.map((item) => {
              const meta = getActivityMeta(item.action);
              const Icon = meta.icon;

              return (
                <li key={item.id} className="flex gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className={cn("h-4 w-4", meta.className)} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{meta.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.actorName ?? "System"} ·{" "}
                      {formatDistanceToNow(item.createdAt, { addSuffix: true, locale: uk })}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
