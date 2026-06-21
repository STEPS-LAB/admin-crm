"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SEO_TEMPLATE_LANGUAGES,
  SEO_TEMPLATE_OWNER_TYPES,
  SEO_TEMPLATE_OWNER_TYPE_LABELS,
} from "@/constants/seo-templates";

export function SeoTemplateListFilters(): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParam = (key: string, value: string | null): void => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        value={searchParams.get("ownerType") ?? "all"}
        onValueChange={(value) => updateParam("ownerType", value === "all" ? null : value)}
      >
        <SelectTrigger className="w-[180px]" aria-label="Filter by entity type" disabled={isPending}>
          <SelectValue placeholder="Entity type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All entity types</SelectItem>
          {SEO_TEMPLATE_OWNER_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {SEO_TEMPLATE_OWNER_TYPE_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("language") ?? "all"}
        onValueChange={(value) => updateParam("language", value === "all" ? null : value)}
      >
        <SelectTrigger className="w-[160px]" aria-label="Filter by language" disabled={isPending}>
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All languages</SelectItem>
          {SEO_TEMPLATE_LANGUAGES.map((language) => (
            <SelectItem key={language} value={language}>
              {language.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {searchParams.get("ownerType") || searchParams.get("language") ? (
        <Button variant="ghost" size="sm" onClick={() => router.replace(pathname)} disabled={isPending}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
