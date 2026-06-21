"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AUDIT_ACTION_LABELS } from "@/constants/audit";

const SECURITY_ACTIONS = Object.keys(AUDIT_ACTION_LABELS);

export function SecurityAuditFilters(): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (search.trim()) {
        params.set("q", search.trim());
      } else {
        params.delete("q");
      }

      params.delete("page");

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, pathname, router, searchParams]);

  const updateAction = (value: string): void => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete("action");
    } else {
      params.set("action", value);
    }

    params.delete("page");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Input
        placeholder="Search actor, IP, or user agent…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        aria-label="Search security audit"
        disabled={isPending}
      />

      <Select value={searchParams.get("action") ?? "all"} onValueChange={updateAction}>
        <SelectTrigger aria-label="Filter by action">
          <SelectValue placeholder="Action" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All actions</SelectItem>
          {SECURITY_ACTIONS.map((action) => (
            <SelectItem key={action} value={action}>
              {AUDIT_ACTION_LABELS[action]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
