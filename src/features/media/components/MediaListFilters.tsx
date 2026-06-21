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
import { ALLOWED_IMAGE_MIME_TYPES, MEDIA_LIBRARY_FILTERS } from "@/constants/media";

export function MediaListFilters(): React.JSX.Element {
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
        placeholder="Search filename or alt text…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        aria-label="Search media"
        disabled={isPending}
      />

      <Select
        value={searchParams.get("mimeType") ?? "all"}
        onValueChange={(value) => updateParam("mimeType", value === "all" ? null : value)}
      >
        <SelectTrigger aria-label="Filter by type">
          <SelectValue placeholder="File type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All image types</SelectItem>
          {ALLOWED_IMAGE_MIME_TYPES.map((mimeType) => (
            <SelectItem key={mimeType} value={mimeType}>
              {mimeType.replace("image/", "").toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("filter") ?? "all"}
        onValueChange={(value) => updateParam("filter", value === "all" ? null : value)}
      >
        <SelectTrigger aria-label="Filter by usage">
          <SelectValue placeholder="Usage" />
        </SelectTrigger>
        <SelectContent>
          {MEDIA_LIBRARY_FILTERS.map((filter) => (
            <SelectItem key={filter} value={filter}>
              {filter === "all" ? "All files" : "Unused only"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
