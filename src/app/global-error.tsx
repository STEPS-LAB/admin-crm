"use client";

import { useEffect } from "react";

import { clearDeploymentReloadGuard } from "@/lib/client/deploymentRecovery";

const CHUNK_ERROR_PATTERN =
  /ChunkLoadError|Loading chunk \d+ failed|Failed to fetch dynamically imported module|Importing a module script failed/i;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  useEffect(() => {
    console.error(error);

    if (CHUNK_ERROR_PATTERN.test(error.message)) {
      clearDeploymentReloadGuard();
      window.location.reload();
    }
  }, [error]);

  return (
    <html lang="uk">
      <body className="flex min-h-screen items-center justify-center bg-neutral-950 p-6 text-neutral-100">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-neutral-400">
            The page failed to load. This can happen after an update is deployed.
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-neutral-950"
              onClick={() => {
                clearDeploymentReloadGuard();
                window.location.reload();
              }}
            >
              Reload page
            </button>
            <button
              type="button"
              className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium"
              onClick={reset}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
