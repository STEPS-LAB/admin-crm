"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PUBLIC_SITE_SEARCH_MAX_QUERY_LENGTH } from "@/constants/public-site";
import { getPublicSiteMessage } from "@/lib/public-site/messages";
import { buildPublicSiteSearchHref } from "@/lib/public-site/paths";

import type { PublicSiteLanguage } from "@/types/public-site";

export interface SiteSearchFormProps {
  readonly language: PublicSiteLanguage;
  readonly initialQuery?: string;
  readonly className?: string;
}

export function SiteSearchForm({
  language,
  initialQuery = "",
  className,
}: SiteSearchFormProps): React.JSX.Element {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  const submitSearch = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const trimmed = query.trim();

    if (!trimmed) {
      return;
    }

    startTransition(() => {
      router.push(buildPublicSiteSearchHref(language, trimmed));
    });
  };

  return (
    <form onSubmit={submitSearch} className={className} role="search">
      <label htmlFor="site-search" className="sr-only">
        {getPublicSiteMessage(language, "search.title")}
      </label>
      <div className="flex items-center gap-2">
        <Input
          id="site-search"
          name="q"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={getPublicSiteMessage(language, "search.placeholder")}
          maxLength={PUBLIC_SITE_SEARCH_MAX_QUERY_LENGTH}
          autoComplete="off"
          className="h-9 w-36 sm:w-48"
        />
        <Button type="submit" size="sm" disabled={isPending || !query.trim()}>
          {getPublicSiteMessage(language, "search.submit")}
        </Button>
      </div>
    </form>
  );
}
