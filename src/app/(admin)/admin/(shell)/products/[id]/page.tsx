import { notFound } from "next/navigation";

import { getProductAction, getProductFormOptionsAction, getProductMediaAction } from "@/actions/products";
import { PageHeader } from "@/components/navigation/PageHeader";
import { ProductForm } from "@/features/products/components/ProductForm";
import { ProductStatusBadge } from "@/features/products/components/ProductStatusBadge";
import { getOwnerSeoScore } from "@/services/publishWarningsService";

import type { ProductFormValues } from "@/schemas/products/productSchemas";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<{ title: string }> {
  const { id } = await params;
  const product = await getProductAction(id);

  return {
    title: product?.translations.uk.name ?? "Edit product",
  };
}

interface EditProductPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const [product, formOptions, media, seoScore] = await Promise.all([
    getProductAction(id),
    getProductFormOptionsAction(),
    getProductMediaAction(id),
    getOwnerSeoScore("product", id),
  ]);

  if (!product || !media) {
    notFound();
  }

  const defaultValues: ProductFormValues = {
    sku: product.sku,
    barcode: product.barcode,
    categoryId: product.categoryId,
    brandId: product.brandId,
    status: product.status,
    price: product.price,
    oldPrice: product.oldPrice,
    currency: product.currency,
    stockQuantity: product.stockQuantity,
    stockStatus: product.stockStatus,
    translations: product.translations,
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title={product.translations.uk.name}
        description={`SKU ${product.sku}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: product.translations.uk.name },
        ]}
        actions={<ProductStatusBadge status={product.status} />}
      />

      <div className="mt-8">
        <ProductForm
          mode="edit"
          productId={product.id}
          defaultValues={defaultValues}
          categories={formOptions.categories}
          brands={formOptions.brands}
          media={media}
          seoScore={seoScore}
        />
      </div>
    </div>
  );
}
