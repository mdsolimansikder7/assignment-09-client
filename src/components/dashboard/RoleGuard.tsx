"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Loader } from "@/components/shared/Loader";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";

interface RoleGuardProps {
  role: UserRole;
  children: React.ReactNode;
}

export function RoleGuard({ role, children }: RoleGuardProps) {
  const router = useRouter();
  const { user, isLoading, isLoggedIn } = useAuth();

  const roleMismatch = Boolean(user && user.role !== role);
  const showLoader = isLoading || !isLoggedIn || roleMismatch;

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }
    if (user && user.role !== role) {
      router.replace(
        user.role === "owner"
          ? "/dashboard/owner"
          : user.role === "customer"
            ? "/dashboard/customer"
            : `/dashboard/${user.role}`
      );
    }
  }, [isLoading, isLoggedIn, user, role, router]);

  if (showLoader) {
    return <Loader label={roleMismatch ? "Redirecting…" : "Checking your session…"} />;
  }

  return <>{children}</>;
}
