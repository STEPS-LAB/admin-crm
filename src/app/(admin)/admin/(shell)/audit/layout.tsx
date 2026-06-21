import { AuditNav } from "@/features/audit/components/AuditNav";

export default function AuditLayout({
  children,
}: {
  readonly children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <AuditNav />
      {children}
    </div>
  );
}
