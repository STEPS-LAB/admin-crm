import Link from "next/link";
import { ExternalLink, Mail, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicSiteMessage } from "@/lib/public-site/messages";

import type { PublicSiteLanguage } from "@/types/public-site";

export interface SiteContactSectionProps {
  readonly siteName: string;
  readonly siteUrl: string;
  readonly timezone: string;
  readonly currency: string;
  readonly language: PublicSiteLanguage;
}

export function SiteContactSection({
  siteName,
  siteUrl,
  timezone,
  currency,
  language,
}: SiteContactSectionProps): React.JSX.Element {
  return (
    <section id="contact" className="scroll-mt-24 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-8">
          <p className="text-primary text-sm font-medium">
            {getPublicSiteMessage(language, "contact.eyebrow")}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            {getPublicSiteMessage(language, "contact.title")}
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            {getPublicSiteMessage(language, "contact.description")}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-4 w-4" />
                {getPublicSiteMessage(language, "contact.website")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={siteUrl}
                className="text-primary inline-flex items-center gap-2 text-sm hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {siteUrl}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                {getPublicSiteMessage(language, "contact.regionalSettings")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-1 text-sm">
              <p>
                {getPublicSiteMessage(language, "contact.timezone")}: {timezone}
              </p>
              <p>
                {getPublicSiteMessage(language, "contact.currency")}: {currency}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {getPublicSiteMessage(language, "contact.administration")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-sm">
                {getPublicSiteMessage(language, "contact.adminDescription", { siteName })}
              </p>
              <Button asChild>
                <Link href="/admin">{getPublicSiteMessage(language, "contact.openDashboard")}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
