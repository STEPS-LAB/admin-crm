export const AUTH_ROUTES = {
  login: "/admin/login",
  dashboard: "/admin",
} as const;

export const PROTECTED_ADMIN_PREFIX = "/admin";

export const PUBLIC_ADMIN_PATHS = [AUTH_ROUTES.login] as const;

export const CMS_SESSION_COOKIE = "cms_session_id";
export const CMS_SESSION_REMEMBER_COOKIE = "cms_session_remember";

export const ADMIN_SESSION_ENSURE_PATH = "/api/internal/admin/session/ensure";
export const ADMIN_SESSION_TERMINATE_PATH = "/api/internal/admin/session/terminate";

export const ADMIN_PATHNAME_HEADER = "x-pathname";

export const IP_POLICY_CACHE_SECONDS = 60;

export const RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
} as const;

export const SESSION_DEFAULTS = {
  idleTimeoutHours: 8,
  absoluteLifetimeHours: 24,
} as const;

/** Skip session last-activity writes when touched within this interval. */
export const SESSION_ACTIVITY_TOUCH_INTERVAL_SECONDS = 300;
