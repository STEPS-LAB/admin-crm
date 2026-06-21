import { SettingsNav } from "@/features/settings/components/SettingsNav";

export default function SettingsLayout({
  children,
}: {
  readonly children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <SettingsNav />
      {children}
    </div>
  );
}
