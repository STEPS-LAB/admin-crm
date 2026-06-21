import { AuthStateSync } from "@/features/authentication/components/AuthStateSync";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <>
      <AuthStateSync />
      {children}
    </>
  );
}
