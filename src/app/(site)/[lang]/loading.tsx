"use client";

import { usePathname } from "next/navigation";

import { extractLanguageFromPathname } from "@/lib/public-site/pathLanguage";
import { getPublicSiteMessage } from "@/lib/public-site/messages";

export default function PublicSiteLoading(): React.JSX.Element {
  const pathname = usePathname();
  const language = extractLanguageFromPathname(pathname) ?? "uk";

  return (
    <div className="bg-background text-foreground flex min-h-screen items-center justify-center">
      <div className="space-y-3 text-center">
        <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
        <p className="text-muted-foreground text-sm">
          {getPublicSiteMessage(language, "loading.storefront")}
        </p>
      </div>
    </div>
  );
}
