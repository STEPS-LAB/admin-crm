import { PageHeader } from "@/components/navigation/PageHeader";
import { CatalogExportPanel } from "@/features/import-export/components/CatalogExportPanel";
import { CatalogImportPanel } from "@/features/import-export/components/CatalogImportPanel";

export const metadata = {
  title: "Import & Export",
};

export default function ImportExportPage(): React.JSX.Element {
  return (
    <>
      <PageHeader
        title="Import & Export"
        description="Validate catalog imports, export portable datasets, and roll back recent import batches"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Import & Export" },
        ]}
      />

      <div className="mt-8 grid max-w-5xl gap-6">
        <CatalogImportPanel />
        <CatalogExportPanel />
      </div>
    </>
  );
}
