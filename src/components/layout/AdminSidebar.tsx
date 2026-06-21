"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import {
  ADMIN_NAV_SECTIONS,
  isNavItemActive,
  WEBSITE_NAV_ITEM,
  type NavItem,
} from "@/constants/navigation";

import { useSidebar } from "./SidebarProvider";

interface SidebarNavProps {
  readonly collapsed?: boolean;
  readonly onNavigate?: () => void;
}

function NavLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}): React.JSX.Element {
  const pathname = usePathname();
  const active = item.enabled && isNavItemActive(pathname, item.href);
  const Icon = item.icon;

  if (!item.enabled) {
    return (
      <div
        className={cn(
          "flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground/60",
          collapsed && "justify-center px-2",
        )}
        aria-disabled="true"
        title={collapsed ? item.label : undefined}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
        {!collapsed ? (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge ? (
              <Badge variant="secondary" className="text-[10px]">
                {item.badge}
              </Badge>
            ) : null}
          </>
        ) : null}
      </div>
    );
  }

  const linkClassName = cn(
    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
    collapsed && "justify-center px-2",
    active
      ? "bg-sidebar-accent text-foreground"
      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
        {...(onNavigate ? { onClick: onNavigate } : {})}
        title={collapsed ? item.label : undefined}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
        {!collapsed ? <span className="truncate">{item.label}</span> : null}
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      className={linkClassName}
      {...(onNavigate ? { onClick: onNavigate } : {})}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
    </Link>
  );
}

export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps): React.JSX.Element {
  return (
    <nav className="flex flex-1 flex-col gap-6 px-3 py-4" aria-label="Admin navigation">
      {ADMIN_NAV_SECTIONS.map((section) => (
        <div key={section.id} className="space-y-1">
          {section.items.map((item) => (
            <NavLink
              key={item.id}
              item={item}
              collapsed={collapsed}
              {...(onNavigate ? { onNavigate } : {})}
            />
          ))}
        </div>
      ))}

      <div className="mt-auto border-t border-sidebar-border pt-4">
        <NavLink
          item={WEBSITE_NAV_ITEM}
          collapsed={collapsed}
          {...(onNavigate ? { onNavigate } : {})}
        />
      </div>
    </nav>
  );
}

export function AdminSidebar(): React.JSX.Element {
  const { collapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-in-out md:flex",
        collapsed ? "w-[72px]" : "w-[280px]",
      )}
      aria-label="Sidebar"
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-sidebar-border px-4",
          collapsed && "justify-center px-2",
        )}
      >
        <Link href="/admin" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">
            S
          </span>
          {!collapsed ? <span>SEO CMS</span> : null}
        </Link>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <SidebarNav collapsed={collapsed} />
      </div>
    </aside>
  );
}

export function MobileSidebar(): React.JSX.Element {
  const { mobileOpen, setMobileOpen } = useSidebar();

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 md:hidden",
        mobileOpen ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!mobileOpen}
    >
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-black/60 transition-opacity duration-300",
          mobileOpen ? "opacity-100" : "opacity-0",
        )}
        aria-label="Close navigation menu"
        onClick={() => setMobileOpen(false)}
      />
      <aside
        className={cn(
          "absolute inset-y-0 left-0 flex w-[280px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-lg transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Mobile navigation"
      >
        <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-semibold tracking-tight"
            onClick={() => setMobileOpen(false)}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">
              S
            </span>
            <span>SEO CMS</span>
          </Link>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </div>
      </aside>
    </div>
  );
}
