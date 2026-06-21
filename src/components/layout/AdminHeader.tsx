"use client";

import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

import { ThemeToggle } from "./ThemeToggle";
import { NotificationBellLive } from "./NotificationBellLive";
import { useSidebar } from "./SidebarProvider";
import { UserMenu } from "./UserMenu";

import type { AuthUser } from "@/types/auth";

export interface AdminHeaderProps {
  readonly user: AuthUser;
  readonly className?: string;
}

export function AdminHeader({
  user,
  className,
}: AdminHeaderProps): React.JSX.Element {
  const { collapsed, toggleCollapsed, setMobileOpen } = useSidebar();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="hidden md:inline-flex"
        onClick={toggleCollapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <NotificationBellLive userId={user.id} />
        <ThemeToggle />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
