import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicSiteMessage } from "@/lib/public-site/messages";
import { buildPublicSiteHomeHref } from "@/lib/public-site/paths";

import type { PublicSiteContext } from "@/types/public-site";

export interface MaintenanceNoticeProps {
  readonly context: PublicSiteContext;
}

export function MaintenanceNotice({ context }: MaintenanceNoticeProps): React.JSX.Element {
  const { settings, language } = context;
  const title = getPublicSiteMessage(language, "maintenance.title");
  const description =
    settings.siteDescription?.trim() || getPublicSiteMessage(language, "maintenance.description");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-lg border-border/60 shadow-sm">
        <CardHeader className="items-center space-y-4 text-center">
          {settings.logoUrl ? (
            <div className="relative h-12 w-40">
              <Image
                src={settings.logoUrl}
                alt={settings.siteName}
                fill
                className="object-contain"
                sizes="160px"
                priority
              />
            </div>
          ) : (
            <p className="text-sm font-semibold tracking-tight text-primary">{settings.siteName}</p>
          )}
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center text-sm text-muted-foreground">
          <p>{description}</p>
          <Button variant="outline" asChild>
            <Link href={buildPublicSiteHomeHref(language)}>
              {getPublicSiteMessage(language, "maintenance.returnHome")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
