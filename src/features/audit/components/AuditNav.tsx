"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AUDIT_TABS } from "@/constants/audit";
import { cn } from "@/lib/utils/cn";

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin/audit") {
    return pathname === "/admin/audit" || pathname.startsWith("/admin/audit/changes");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AuditNav(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-b border-border/60 pb-4" aria-label="Audit log sections">
      {AUDIT_TABS.map((item) => {
        const active = isActive(pathname, item.href);

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
