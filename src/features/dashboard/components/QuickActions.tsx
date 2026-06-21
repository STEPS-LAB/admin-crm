import Link from "next/link";
import { ExternalLink, FolderTree, Map, Package, Search, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ACTIONS = [
  { label: "Create Product", href: "/admin/products", icon: Package },
  { label: "Create Category", href: "/admin/categories", icon: FolderTree },
  { label: "Open SEO Center", href: "/admin/seo", icon: Search },
  { label: "Generate Sitemap", href: "/admin/seo", icon: Map },
  { label: "View Website", href: "/site", icon: ExternalLink, external: true },
  { label: "Open Settings", href: "/admin/settings", icon: Settings },
] as const;

export function QuickActions(): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quick actions</CardTitle>
        <CardDescription>Common workflows for daily administration</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2">
        {ACTIONS.map((action) => {
          const Icon = action.icon;

          if ("external" in action && action.external) {
            return (
              <Button key={action.label} variant="outline" className="justify-start" asChild>
                <a href={action.href} target="_blank" rel="noopener noreferrer">
                  <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                  {action.label}
                </a>
              </Button>
            );
          }

          return (
            <Button key={action.label} variant="outline" className="justify-start" asChild>
              <Link href={action.href}>
                <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                {action.label}
              </Link>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
