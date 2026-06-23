"use client";

import { AdminHeader } from "./AdminHeader";
import { AdminSidebar, MobileSidebar } from "./AdminSidebar";
import { DeveloperToolbar } from "./DeveloperToolbar";
import { AdminLocaleProvider } from "@/providers/AdminLocaleProvider";

import type { AdvancedSettingsValues } from "@/schemas/settings/settingsSchemas";
import type { AuthUser } from "@/types/auth";

export interface AdminShellProps {
  readonly user: AuthUser;
  readonly developerDiagnostics?: AdvancedSettingsValues;
  readonly children: React.ReactNode;
}

export function AdminShell({
  user,
  developerDiagnostics,
  children,
}: AdminShellProps): React.JSX.Element {
  return (
    <AdminLocaleProvider initialLocale={user.locale}>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <MobileSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader user={user} />
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
        {developerDiagnostics ? <DeveloperToolbar diagnostics={developerDiagnostics} /> : null}
      </div>
    </AdminLocaleProvider>
  );
}
