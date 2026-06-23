"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { ErrorState } from "@/components/feedback/ErrorState";
import { clearDeploymentReloadGuard } from "@/lib/client/deploymentRecovery";
import { extractLanguageFromPathname } from "@/lib/public-site/pathLanguage";
import { getPublicSiteMessage } from "@/lib/public-site/messages";

const CHUNK_ERROR_PATTERN =
  /ChunkLoadError|Loading chunk \d+ failed|Failed to fetch dynamically imported module|Importing a module script failed/i;

function isChunkLoadError(error: Error): boolean {
  return CHUNK_ERROR_PATTERN.test(error.message);
}

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

  useEffect(() => {
    if (!isChunkLoadError(error)) {
      return;
    }

    clearDeploymentReloadGuard();
    window.location.reload();
  }, [error]);

  const handleRetry = (): void => {
    if (isChunkLoadError(error)) {
      clearDeploymentReloadGuard();
      window.location.reload();
      return;
    }

    reset();
  };

  return (
    <main className="bg-muted/20 flex min-h-screen items-center justify-center p-6">
      <ErrorState
        title={getPublicSiteMessage(language, "error.title")}
        message={getPublicSiteMessage(language, "error.description")}
        retryLabel={getPublicSiteMessage(language, "error.retry")}
        onRetry={handleRetry}
      />
    </main>
  );
}
