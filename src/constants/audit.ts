export const AUDIT_TABS = [
  { id: "changes", label: "Change history", href: "/admin/audit" },
  { id: "security", label: "Security", href: "/admin/audit/security" },
] as const;

export type AuditTabId = (typeof AUDIT_TABS)[number]["id"];

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  LOGIN: "Signed in",
  LOGOUT: "Signed out",
  FAILED_LOGIN: "Failed login",
  PASSWORD_RESET: "Password reset",
  PROFILE_UPDATED: "Profile updated",
};

export const HISTORY_ENTITY_LABELS: Record<string, string> = {
  product: "Product",
  category: "Category",
  seo_profile: "SEO profile",
  metadata: "Metadata",
  schema: "Schema",
  redirect: "Redirect",
  media: "Media",
  settings: "Settings",
  page: "Page",
  brand: "Brand",
  system: "System",
};

export const HISTORY_OPERATION_LABELS: Record<string, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  restore: "Restored",
  publish: "Published",
  unpublish: "Unpublished",
  login: "Login",
  logout: "Logout",
  import: "Imported",
  export: "Exported",
  generate: "Generated",
  scan: "Scanned",
  system: "System",
};
