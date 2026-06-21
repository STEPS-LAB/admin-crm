"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/feedback/ErrorState";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <ErrorState
        title="Unable to load this page"
        message="An unexpected error occurred. Please try again."
        onRetry={reset}
      />
    </main>
  );
}
