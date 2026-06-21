import { redirect } from "next/navigation";

import { getCurrentUserAction } from "@/actions/authentication/getCurrentUser";
import { getSettingsAction } from "@/actions/settings";
import { AdminShell, SidebarProvider } from "@/components/layout";
import { AUTH_ROUTES } from "@/constants/auth";
import { resolveDeveloperDiagnostics } from "@/lib/system/developerMode";
import { enforceAdminSecurityGate } from "@/services/adminSecurityService";

export default async function AuthenticatedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.JSX.Element> {
  const user = await getCurrentUserAction();

  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const settings = await getSettingsAction();
  await enforceAdminSecurityGate(user, settings);

  const developerDiagnostics = resolveDeveloperDiagnostics({
    developerModeEnabled: settings.developerModeEnabled,
    showSqlQueries: settings.showSqlQueries,
    showApiTiming: settings.showApiTiming,
    showServerActions: settings.showServerActions,
    mockDataEnabled: settings.mockDataEnabled,
    testModeEnabled: settings.testModeEnabled,
    developerToolbarEnabled: settings.developerToolbarEnabled,
    verboseLoggingEnabled: settings.verboseLoggingEnabled,
  });

  return (
    <SidebarProvider>
      <AdminShell user={user} developerDiagnostics={developerDiagnostics}>
        {children}
      </AdminShell>
    </SidebarProvider>
  );
}
