import { Suspense, cache } from "react";

import { MaintenanceNotice } from "@/features/public-site/components/MaintenanceNotice";
import { SiteFooter } from "@/features/public-site/components/SiteFooter";
import { SiteHeader } from "@/features/public-site/components/SiteHeader";
import { loadPublicSiteContext } from "@/services/publicSiteService";

import type { PublicSiteContext } from "@/types/public-site";

export interface PublicSiteShellProps {
  readonly context: PublicSiteContext;
  readonly generatedAt?: Date;
  readonly children: React.ReactNode;
}

export function PublicSiteShell({
  context,
  generatedAt = new Date(),
  children,
}: PublicSiteShellProps): React.JSX.Element {
  return (
    <>
      <Suspense fallback={<div className="bg-muted/30 h-16 border-b" />}>
        <SiteHeader
          siteName={context.settings.siteName}
          language={context.language}
          supportedLanguages={context.supportedLanguages}
          languageSwitcherEnabled={context.languageSwitcherEnabled}
        />
      </Suspense>
      {children}
      <SiteFooter
        siteName={context.settings.siteName}
        generatedAt={generatedAt}
        language={context.language}
      />
    </>
  );
}

export const loadPublicSitePageContext = cache(async function loadPublicSitePageContext(
  langParam: string | undefined,
): Promise<{ readonly maintenance: boolean; readonly context: PublicSiteContext }> {
  const context = await loadPublicSiteContext(langParam);

  return {
    maintenance: context.settings.maintenanceMode,
    context,
  };
});

export interface PublicSiteMaintenanceProps {
  readonly context: PublicSiteContext;
}

export function PublicSiteMaintenance({ context }: PublicSiteMaintenanceProps): React.JSX.Element {
  return <MaintenanceNotice context={context} />;
}
