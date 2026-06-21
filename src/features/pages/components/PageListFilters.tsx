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
import { PAGE_STATUSES, PAGE_STATUS_LABELS, PAGE_TYPES, PAGE_TYPE_LABELS } from "@/constants/pages";

export function PageListFilters(): React.JSX.Element {
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

  const updateParam = (key: string, value: string | null): void => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.delete("page");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Input
        placeholder="Search title, slug, excerpt…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        aria-label="Search pages"
        disabled={isPending}
      />

      <Select
        value={searchParams.get("status") ?? "all"}
        onValueChange={(value) => updateParam("status", value === "all" ? null : value)}
      >
        <SelectTrigger aria-label="Filter by status">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {PAGE_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {PAGE_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("pageType") ?? "all"}
        onValueChange={(value) => updateParam("pageType", value === "all" ? null : value)}
      >
        <SelectTrigger aria-label="Filter by page type">
          <SelectValue placeholder="Page type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {PAGE_TYPES.map((pageType) => (
            <SelectItem key={pageType} value={pageType}>
              {PAGE_TYPE_LABELS[pageType]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
