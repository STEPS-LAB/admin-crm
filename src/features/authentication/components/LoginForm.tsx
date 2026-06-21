"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { loginAction } from "@/actions/authentication/login";
import { AUTH_ROUTES } from "@/constants/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/schemas/authentication/loginSchema";

import type { ServerActionResult } from "@/types";
import type { AuthUser } from "@/types/auth";

const initialState: ServerActionResult<AuthUser> | null = null;

export function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  useEffect(() => {
    const errorCode = searchParams.get("error");

    if (errorCode === "ip_blocked") {
      setError("root", {
        message: "Access from your IP address is not allowed.",
      });
    } else if (errorCode === "session_expired") {
      setError("root", {
        message: "Your session expired. Please sign in again.",
      });
    }
  }, [searchParams, setError]);

  useEffect(() => {
    if (state?.success) {
      const redirectTo = searchParams.get("redirect");
      const destination =
        redirectTo?.startsWith("/admin") ? redirectTo : AUTH_ROUTES.dashboard;
      router.replace(destination);
      router.refresh();
    }

    if (state && !state.success) {
      setError("root", { message: state.error });
    }
  }, [state, router, searchParams, setError]);

  const onSubmit = handleSubmit((data) => {
    const formData = new FormData();
    formData.set("email", data.email);
    formData.set("password", data.password);
    if (data.rememberMe) {
      formData.set("rememberMe", "true");
    }
    formAction(formData);
  });

  return (
    <Card className="w-full max-w-md border-border/60 shadow-lg">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <span className="text-lg font-bold">S</span>
        </div>
        <CardTitle className="text-2xl">SEO CMS</CardTitle>
        <CardDescription>Sign in to the administration panel</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
            {errors.email ? (
              <p id="email-error" className="text-sm text-destructive" role="alert">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••••••"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
                className="pr-10"
                {...register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => {
                  setShowPassword((current) => !current);
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.password ? (
              <p id="password-error" className="text-sm text-destructive" role="alert">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="rememberMe"
              type="checkbox"
              className="h-4 w-4 rounded border-input accent-primary"
              {...register("rememberMe")}
            />
            <Label htmlFor="rememberMe" className="font-normal">
              Remember me
            </Label>
          </div>

          {errors.root ? (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {errors.root.message}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isPending} aria-busy={isPending}>
            {isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">Version 0.1.0</p>
      </CardContent>
    </Card>
  );
}
