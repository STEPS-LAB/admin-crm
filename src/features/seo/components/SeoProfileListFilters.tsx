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
import { SEO_OWNER_TYPES, SEO_OWNER_TYPE_LABELS } from "@/constants/seo";

export function SeoProfileListFilters(): React.JSX.Element {
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
        placeholder="Search title, description, entity…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        aria-label="Search SEO profiles"
        disabled={isPending}
      />

      <Select
        value={searchParams.get("ownerType") ?? "all"}
        onValueChange={(value) => updateParam("ownerType", value === "all" ? null : value)}
      >
        <SelectTrigger aria-label="Filter by entity type">
          <SelectValue placeholder="Entity type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All entity types</SelectItem>
          {SEO_OWNER_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {SEO_OWNER_TYPE_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("language") ?? "all"}
        onValueChange={(value) => updateParam("language", value === "all" ? null : value)}
      >
        <SelectTrigger aria-label="Filter by language">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All languages</SelectItem>
          <SelectItem value="uk">Ukrainian</SelectItem>
          <SelectItem value="en">English</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
