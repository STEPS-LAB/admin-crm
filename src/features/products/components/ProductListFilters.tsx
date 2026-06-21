"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRODUCT_STATUSES,
  PRODUCT_STATUS_LABELS,
  STOCK_STATUSES,
  STOCK_STATUS_LABELS,
} from "@/constants/products";

import type { ProductFormLookupOption } from "@/types/products";

export interface ProductListFiltersProps {
  readonly categories: ProductFormLookupOption[];
  readonly brands: ProductFormLookupOption[];
}

export function ProductListFilters({
  categories,
  brands,
}: ProductListFiltersProps): React.JSX.Element {
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
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <Input
        placeholder="Search name, SKU, slug…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        aria-label="Search products"
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
          {PRODUCT_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {PRODUCT_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("categoryId") ?? "all"}
        onValueChange={(value) => updateParam("categoryId", value === "all" ? null : value)}
      >
        <SelectTrigger aria-label="Filter by category">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("brandId") ?? "all"}
        onValueChange={(value) => updateParam("brandId", value === "all" ? null : value)}
      >
        <SelectTrigger aria-label="Filter by brand">
          <SelectValue placeholder="Brand" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All brands</SelectItem>
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={brand.id}>
              {brand.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("stockStatus") ?? "all"}
        onValueChange={(value) => updateParam("stockStatus", value === "all" ? null : value)}
      >
        <SelectTrigger aria-label="Filter by stock">
          <SelectValue placeholder="Stock" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All stock states</SelectItem>
          {STOCK_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {STOCK_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(searchParams.get("filter") ?? searchParams.get("q")) ? (
        <Button
          variant="ghost"
          size="sm"
          className="xl:col-span-5 xl:justify-start"
          onClick={() => router.replace(pathname)}
        >
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
