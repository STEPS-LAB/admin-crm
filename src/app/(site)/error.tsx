"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { ErrorState } from "@/components/feedback/ErrorState";
import { extractLanguageFromPathname } from "@/lib/public-site/pathLanguage";
import { getPublicSiteMessage } from "@/lib/public-site/messages";

export default function PublicSiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  const pathname = usePathname();
  const language = extractLanguageFromPathname(pathname) ?? "uk";

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/20 p-6">
      <ErrorState
        title={getPublicSiteMessage(language, "error.title")}
        message={getPublicSiteMessage(language, "error.description")}
        retryLabel={getPublicSiteMessage(language, "error.retry")}
        onRetry={reset}
      />
    </main>
  );
}
