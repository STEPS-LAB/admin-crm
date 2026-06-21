import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  FileText,
  FolderTree,
  Image,
  Import,
  LayoutDashboard,
  Package,
  Plug,
  ScrollText,
  Search,
  Settings,
  Tag,
  Trash2,
  Webhook,
  ExternalLink,
} from "lucide-react";

export interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly icon: LucideIcon;
  readonly enabled: boolean;
  readonly external?: boolean;
  readonly badge?: string;
}

export interface NavSection {
  readonly id: string;
  readonly items: NavItem[];
}

export const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    id: "main",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        enabled: true,
      },
      {
        id: "products",
        label: "Products",
        href: "/admin/products",
        icon: Package,
        enabled: true,
      },
      {
        id: "categories",
        label: "Categories",
        href: "/admin/categories",
        icon: FolderTree,
        enabled: true,
      },
      {
        id: "catalog-trash",
        label: "Trash",
        href: "/admin/catalog/trash",
        icon: Trash2,
        enabled: true,
      },
      {
        id: "import-export",
        label: "Import & Export",
        href: "/admin/import",
        icon: Import,
        enabled: true,
      },
      {
        id: "seo",
        label: "SEO Center",
        href: "/admin/seo",
        icon: Search,
        enabled: true,
      },
      {
        id: "settings",
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
        enabled: true,
      },
      {
        id: "media",
        label: "Media",
        href: "/admin/media",
        icon: Image,
        enabled: true,
      },
      {
        id: "analytics",
        label: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
        enabled: true,
      },
      {
        id: "pages",
        label: "Pages",
        href: "/admin/pages",
        icon: FileText,
        enabled: true,
      },
      {
        id: "brands",
        label: "Brands",
        href: "/admin/brands",
        icon: Tag,
        enabled: true,
      },
      {
        id: "audit",
        label: "Audit Logs",
        href: "/admin/audit",
        icon: ScrollText,
        enabled: true,
      },
      {
        id: "notifications",
        label: "Notifications",
        href: "/admin/notifications",
        icon: Bell,
        enabled: true,
      },
      {
        id: "api",
        label: "API",
        href: "/admin/api",
        icon: Webhook,
        enabled: true,
      },
      {
        id: "plugins",
        label: "Plugins",
        href: "/admin/plugins",
        icon: Plug,
        enabled: true,
      },
    ],
  },
];

export const WEBSITE_NAV_ITEM: NavItem = {
  id: "website",
  label: "Go to Website",
  href: "/site",
  icon: ExternalLink,
  enabled: true,
  external: true,
};

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
