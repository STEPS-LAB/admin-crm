export const SEO_TEMPLATE_OWNER_TYPES = [
  "product",
  "category",
  "page",
  "brand",
  "global",
] as const;

export type SeoTemplateOwnerType = (typeof SEO_TEMPLATE_OWNER_TYPES)[number];

export const SEO_TEMPLATE_OWNER_TYPE_LABELS: Record<SeoTemplateOwnerType, string> = {
  product: "Product",
  category: "Category",
  page: "Page",
  brand: "Brand",
  global: "Global",
};

export const SEO_TEMPLATE_LANGUAGES = ["uk", "en"] as const;

export type SeoTemplateLanguage = (typeof SEO_TEMPLATE_LANGUAGES)[number];

export interface SeoTemplateVariableDefinition {
  readonly token: string;
  readonly label: string;
  readonly description: string;
}

export const SEO_TEMPLATE_COMMON_VARIABLES: readonly SeoTemplateVariableDefinition[] = [
  { token: "{{site.name}}", label: "Site name", description: "Website name from settings" },
  { token: "{{site.description}}", label: "Site description", description: "Default site description" },
  { token: "{{site.url}}", label: "Site URL", description: "Canonical site URL" },
  { token: "{{year}}", label: "Year", description: "Current calendar year" },
  { token: "{{language}}", label: "Language", description: "Profile language code" },
];

export const SEO_TEMPLATE_OWNER_VARIABLES: Record<
  SeoTemplateOwnerType,
  readonly SeoTemplateVariableDefinition[]
> = {
  product: [
    { token: "{{product.name}}", label: "Product name", description: "Localized product title" },
    {
      token: "{{product.short_description}}",
      label: "Short description",
      description: "Product short description",
    },
    { token: "{{product.description}}", label: "Description", description: "Full product description" },
    { token: "{{product.slug}}", label: "Slug", description: "Product URL slug" },
    { token: "{{price}}", label: "Price", description: "Product price" },
    { token: "{{currency}}", label: "Currency", description: "Price currency" },
    { token: "{{sku}}", label: "SKU", description: "Product SKU" },
  ],
  category: [
    { token: "{{category.name}}", label: "Category name", description: "Localized category title" },
    {
      token: "{{category.description}}",
      label: "Description",
      description: "Category description",
    },
    { token: "{{category.slug}}", label: "Slug", description: "Category URL slug" },
  ],
  page: [
    { token: "{{page.title}}", label: "Page title", description: "Localized page title" },
    { token: "{{page.excerpt}}", label: "Excerpt", description: "Page excerpt" },
    { token: "{{page.slug}}", label: "Slug", description: "Page URL slug" },
  ],
  brand: [
    { token: "{{brand.name}}", label: "Brand name", description: "Localized brand name" },
    { token: "{{brand.slug}}", label: "Slug", description: "Brand URL slug" },
  ],
  global: [],
};

export function getSeoTemplateVariables(
  ownerType: SeoTemplateOwnerType,
): readonly SeoTemplateVariableDefinition[] {
  return [...SEO_TEMPLATE_COMMON_VARIABLES, ...SEO_TEMPLATE_OWNER_VARIABLES[ownerType]];
}

export function mapProfileOwnerTypeToTemplateOwnerType(
  ownerType: string,
): SeoTemplateOwnerType | null {
  if (
    ownerType === "product" ||
    ownerType === "category" ||
    ownerType === "page" ||
    ownerType === "brand"
  ) {
    return ownerType;
  }

  return null;
}
