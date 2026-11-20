"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Loader } from "@/components/shared/Loader";
import { useAuth } from "@/hooks/useAuth";

// Guards pages that only need a logged-in user (no specific role).
// Always waits for the auth state first so reloads never bounce to /login.
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) {
      const returnUrl = pathname ? `?returnUrl=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${returnUrl}`);
    }
  }, [isLoading, isLoggedIn, router, pathname]);

  if (isLoading || !isLoggedIn) {
    return <Loader label="Checking your session…" />;
  }

  return <>{children}</>;
}
