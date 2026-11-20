"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FaGoogle } from "react-icons/fa6";
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";
import toast from "react-hot-toast";

import { authClient } from "@/lib/auth-client";
import { fetchApiToken } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { validateEmail, validatePassword } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.replace("/");
    }
  }, [isLoading, isLoggedIn, router]);

  const returnUrl = searchParams.get("returnUrl") || searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) return toast.error(emailError);
    const passwordError = validatePassword(password);
    if (passwordError) return toast.error(passwordError);

    setSubmitting(true);
    try {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        toast.error(error.message ?? "Login failed. Check your credentials.");
        return;
      }
      toast.success("Login successful!");
      await fetchApiToken(email);

      router.replace("/");
      router.refresh();
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/`,
      });
    } catch {
      toast.error("Could not start Google login.");
      setGoogleLoading(false);
    }
  };

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardDescription>Login to your GearLoop account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <span className="flex items-center gap-1">
                    <EyeOffIcon className="size-3.5" /> Hide
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <EyeIcon className="size-3.5" /> Show
                  </span>
                )}
              </button>
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            {submitting && <Loader2Icon className="size-4 animate-spin" />}
            Login
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={googleLoading}
          onClick={handleGoogle}
          className="w-full"
        >
          {googleLoading ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <FaGoogle className="size-4" />
          )}
          Continue with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          New to GearLoop?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
        <p className="text-center text-sm text-muted-foreground">
          Want to list your equipment?{" "}
          <Link href="/register?role=owner" className="font-medium text-primary hover:underline">
            Register as an Owner
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="flex-1">
      <section className="flex min-h-[70vh] items-center justify-center py-16">
        <div className="container-page w-full max-w-md">
          <Suspense fallback={<div className="h-96 rounded-xl bg-muted" />}>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
