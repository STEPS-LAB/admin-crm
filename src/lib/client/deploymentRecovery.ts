const RELOAD_GUARD_KEY = "seo-cms:auto-reload";

const CHUNK_ERROR_PATTERN =
  /ChunkLoadError|Loading chunk \d+ failed|Failed to fetch dynamically imported module|Importing a module script failed/i;

function shouldAutoReload(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return CHUNK_ERROR_PATTERN.test(message);
}

function reloadOnce(): void {
  if (typeof window === "undefined") {
    return;
  }

  if (sessionStorage.getItem(RELOAD_GUARD_KEY) === "1") {
    return;
  }

  sessionStorage.setItem(RELOAD_GUARD_KEY, "1");
  window.location.reload();
}

export function registerDeploymentRecovery(): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const onUnhandledRejection = (event: PromiseRejectionEvent): void => {
    if (!shouldAutoReload(event.reason)) {
      return;
    }

    event.preventDefault();
    reloadOnce();
  };

  const onError = (event: ErrorEvent): void => {
    if (!shouldAutoReload(event.error ?? event.message)) {
      return;
    }

    event.preventDefault();
    reloadOnce();
  };

  window.addEventListener("unhandledrejection", onUnhandledRejection);
  window.addEventListener("error", onError);

  return () => {
    window.removeEventListener("unhandledrejection", onUnhandledRejection);
    window.removeEventListener("error", onError);
  };
}

export function clearDeploymentReloadGuard(): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(RELOAD_GUARD_KEY);
}
