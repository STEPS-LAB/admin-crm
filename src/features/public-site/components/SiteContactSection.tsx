import Link from "next/link";
import { ExternalLink, Mail, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface SiteContactSectionProps {
  readonly siteName: string;
  readonly siteUrl: string;
  readonly timezone: string;
  readonly currency: string;
}

export function SiteContactSection({
  siteName,
  siteUrl,
  timezone,
  currency,
}: SiteContactSectionProps): React.JSX.Element {
  return (
    <section id="contact" className="scroll-mt-24 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">Reach us</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Contact</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Storefront configuration is managed centrally. Update site settings and pages in the admin panel.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-4 w-4" />
                Website
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={siteUrl}
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
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
                Regional settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p>Timezone: {timezone}</p>
              <p>Currency: {currency}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Administration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Manage {siteName} content, SEO, media, and publishing workflow from the dashboard.
              </p>
              <Button asChild>
                <Link href="/admin">Open admin dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
