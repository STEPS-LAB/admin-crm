import { Suspense } from "react";

import {
  getNotificationSettingsAction,
  getNotificationSummaryAction,
  listNotificationsAction,
} from "@/actions/notifications";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/navigation/PageHeader";
import { TablePagination } from "@/components/tables/TablePagination";
import { NotificationFilters } from "@/features/notifications/components/NotificationFilters";
import { NotificationList } from "@/features/notifications/components/NotificationList";
import { NotificationSettingsForm } from "@/features/notifications/components/NotificationSettingsForm";
import { NotificationToolbar } from "@/features/notifications/components/NotificationToolbar";

export const metadata = {
  title: "Notifications",
};

interface NotificationsPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const [pagination, summary, settings] = await Promise.all([
    listNotificationsAction(params),
    getNotificationSummaryAction(),
    getNotificationSettingsAction(),
  ]);

  const queryParams: Record<string, string | undefined> = {
    q: typeof params.q === "string" ? params.q : undefined,
    type: typeof params.type === "string" ? params.type : undefined,
    status: typeof params.status === "string" ? params.status : undefined,
    pageSize: typeof params.pageSize === "string" ? params.pageSize : undefined,
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        title="Notifications"
        description="System events, SEO alerts, and background job updates"
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Notifications" }]}
      />

      <div className="mt-8 space-y-6">
        <NotificationToolbar
          unreadCount={summary.unreadCount}
          criticalCount={summary.criticalCount}
        />

        <Suspense fallback={<div className="h-10 animate-pulse rounded-md bg-muted" />}>
          <NotificationFilters />
        </Suspense>

        {pagination.items.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="You're all caught up. New system, SEO, and workflow alerts will appear here."
          />
        ) : (
          <>
            <NotificationList items={pagination.items} />
            <TablePagination
              pagination={pagination}
              basePath="/admin/notifications"
              searchParams={queryParams}
            />
          </>
        )}

        {settings ? (
          <NotificationSettingsForm
            defaultValues={{
              emailEnabled: settings.emailEnabled,
              pushEnabled: settings.pushEnabled,
              seoAlertsEnabled: settings.seoAlertsEnabled,
              systemAlertsEnabled: settings.systemAlertsEnabled,
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
