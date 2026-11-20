"use client";

import { useAuth } from "./useAuth";
import type { UserRole } from "@/types";

export function useRole() {
  const { user, isLoading, isLoggedIn } = useAuth();

  return {
    role: (user?.role ?? null) as UserRole | null,
    isLoading,
    isLoggedIn,
  };
}
