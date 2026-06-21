"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { extractLanguageFromPathname } from "@/lib/public-site/pathLanguage";
import { getPublicSiteMessage } from "@/lib/public-site/messages";
import { buildPublicSiteHomeHref } from "@/lib/public-site/paths";

export function PublicNotFoundView(): React.JSX.Element {
  const pathname = usePathname();
  const language = extractLanguageFromPathname(pathname) ?? "uk";

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/20 p-6">
      <Card className="w-full max-w-lg border-border/60 shadow-sm">
        <CardHeader className="text-center">
          <p className="text-sm font-medium text-primary">404</p>
          <CardTitle className="text-2xl">{getPublicSiteMessage(language, "notFound.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center text-sm text-muted-foreground">
          <p>{getPublicSiteMessage(language, "notFound.description")}</p>
          <Button asChild>
            <Link href={buildPublicSiteHomeHref(language)}>
              {getPublicSiteMessage(language, "notFound.returnHome")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
