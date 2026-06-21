import { Suspense } from "react";

import { LoginForm } from "@/features/authentication/components/LoginForm";

export const metadata = {
  title: "Sign In",
};

export default function LoginPage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/30 p-6">
      <Suspense fallback={<div className="text-muted-foreground">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
