export default function PublicSiteLoading(): React.JSX.Element {
  return (
    <div className="bg-background text-foreground flex min-h-screen items-center justify-center">
      <div className="space-y-3 text-center">
        <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
        <p className="text-muted-foreground text-sm">Loading storefront…</p>
      </div>
    </div>
  );
}
