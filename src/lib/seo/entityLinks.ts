import type { SeoOwnerType } from "@/constants/seo";

export function getEntityAdminHref(ownerType: SeoOwnerType, ownerId: string): string | null {
  switch (ownerType) {
    case "product":
      return `/admin/products/${ownerId}`;
    case "category":
      return `/admin/categories/${ownerId}`;
    case "page":
      return `/admin/pages/${ownerId}`;
    case "brand":
      return `/admin/brands/${ownerId}`;
    default:
      return null;
  }
}
