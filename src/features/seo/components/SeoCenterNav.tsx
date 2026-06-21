"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SEO_CENTER_NAV } from "@/constants/seo";
import { cn } from "@/lib/utils/cn";

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin/seo") {
    return pathname === "/admin/seo";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SeoCenterNav(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-b border-border/60 pb-4" aria-label="SEO Center sections">
      {SEO_CENTER_NAV.map((item) => {
        if ("disabled" in item && item.disabled) {
          return (
            <span
              key={item.id}
              className="inline-flex cursor-not-allowed items-center rounded-md px-3 py-1.5 text-sm text-muted-foreground/60"
            >
              {item.label}
              <span className="ml-2 text-[10px] uppercase">Soon</span>
            </span>
          );
        }

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
