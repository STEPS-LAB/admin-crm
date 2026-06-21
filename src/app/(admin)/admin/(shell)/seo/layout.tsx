import { SeoCenterNav } from "@/features/seo/components/SeoCenterNav";

export default function SeoCenterLayout({
  children,
}: {
  readonly children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <SeoCenterNav />
      {children}
    </div>
  );
}
