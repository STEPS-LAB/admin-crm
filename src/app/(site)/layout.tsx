export default function PublicSiteGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return <div className="min-h-screen scroll-smooth bg-background text-foreground">{children}</div>;
}
