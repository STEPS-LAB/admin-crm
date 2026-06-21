import Link from "next/link";

import { getProductFormOptionsAction } from "@/actions/products";
import { PageHeader } from "@/components/navigation/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/features/products/components/ProductForm";

import type { ProductFormValues } from "@/schemas/products/productSchemas";

export const metadata = {
  title: "New product",
};

const EMPTY_TRANSLATION = {
  name: "",
  slug: "",
  shortDescription: null,
  description: null,
} as const;

export default async function NewProductPage(): Promise<React.JSX.Element> {
  const formOptions = await getProductFormOptionsAction();
  const defaultCategoryId = formOptions.categories[0]?.id ?? "";

  const defaultValues: ProductFormValues = {
    sku: "",
    barcode: null,
    categoryId: defaultCategoryId,
    brandId: null,
    status: "draft",
    price: "0.00",
    oldPrice: null,
    currency: "UAH",
    stockQuantity: 0,
    stockStatus: "in_stock",
    translations: {
      uk: { ...EMPTY_TRANSLATION },
      en: { ...EMPTY_TRANSLATION },
    },
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="New product"
        description="Create a draft product with Ukrainian and English content."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: "New product" },
        ]}
      />

      <div className="mt-8 space-y-6">
        {formOptions.categories.length === 0 ? (
          <Alert variant="warning">
            <AlertTitle>No categories available</AlertTitle>
            <AlertDescription>
              Create at least one category before adding products.
            </AlertDescription>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/admin/categories/new">Create category</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/admin/products">Back to products</Link>
              </Button>
            </div>
          </Alert>
        ) : (
          <ProductForm
            mode="create"
            defaultValues={defaultValues}
            categories={formOptions.categories}
            brands={formOptions.brands}
          />
        )}
      </div>
    </div>
  );
}
