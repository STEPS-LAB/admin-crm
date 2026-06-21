import { notFound } from "next/navigation";

import { getBrandAction, getBrandMediaAction, getBrandSeoProfilesAction } from "@/actions/brands";
import { PageHeader } from "@/components/navigation/PageHeader";
import { BrandForm } from "@/features/brands/components/BrandForm";
import { BrandStatusBadge } from "@/features/brands/components/BrandStatusBadge";
import { getOwnerSeoScore } from "@/services/publishWarningsService";

import type { BrandFormValues } from "@/schemas/brands/brandSchemas";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<{ title: string }> {
  const { id } = await params;
  const brand = await getBrandAction(id);

  return {
    title: brand?.translations.uk.name ?? "Edit brand",
  };
}

interface EditBrandPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function EditBrandPage({
  params,
}: EditBrandPageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const [brand, media, seoProfiles, seoScore] = await Promise.all([
    getBrandAction(id),
    getBrandMediaAction(id),
    getBrandSeoProfilesAction(id),
    getOwnerSeoScore("brand", id),
  ]);

  if (!brand || !media || !seoProfiles) {
    notFound();
  }

  const defaultValues: BrandFormValues = {
    slug: brand.slug,
    logoUrl: brand.logoUrl,
    website: brand.website,
    country: brand.country,
    status: brand.status,
    translations: brand.translations,
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title={brand.translations.uk.name}
        description={`/${brand.slug}${brand.productCount > 0 ? ` · ${brand.productCount} products` : ""}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Brands", href: "/admin/brands" },
          { label: brand.translations.uk.name },
        ]}
        actions={<BrandStatusBadge status={brand.status} />}
      />

      <div className="mt-8">
        <BrandForm
          mode="edit"
          brandId={brand.id}
          defaultValues={defaultValues}
          media={media}
          seoProfiles={seoProfiles}
          seoScore={seoScore}
        />
      </div>
    </div>
  );
}
