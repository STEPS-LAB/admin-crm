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

export function RedirectListFilters(): React.JSX.Element {
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

  const updateEnabled = (value: string): void => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete("enabled");
    } else {
      params.set("enabled", value);
    }

    params.delete("page");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Input
        placeholder="Search source or destination…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        aria-label="Search redirects"
        disabled={isPending}
      />

      <Select
        value={searchParams.get("enabled") ?? "all"}
        onValueChange={updateEnabled}
      >
        <SelectTrigger aria-label="Filter by status">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All redirects</SelectItem>
          <SelectItem value="true">Enabled only</SelectItem>
          <SelectItem value="false">Disabled only</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
