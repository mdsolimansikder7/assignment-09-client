"use client";

import { useCallback, useEffect, useState } from "react";

import {
  api,
  clearApiSession,
  fetchApiToken,
  loadStoredUser,
} from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { AppUser } from "@/types";

export interface UseAuthResult {
  user: AppUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  logout: () => Promise<void>;
  setUser: (u: AppUser | null) => void;
}

export function useAuth(): UseAuthResult {
  const { data: session, isPending } = authClient.useSession();
  const [user, setUser] = useState<AppUser | null>(() => loadStoredUser());
  const [tokenReady, setTokenReady] = useState(false);

  const email = session?.user?.email ?? null;

  useEffect(() => {
    let cancelled = false;

    async function syncBackendSession() {
      if (isPending) return;

      if (!email) {
        clearApiSession();
        if (!cancelled) {
          setUser(null);
          setTokenReady(true);
        }
        return;
      }

      try {
        const apiUser = await fetchApiToken(email);
        if (!cancelled) setUser(apiUser);
      } catch {
      } finally {
        if (!cancelled) setTokenReady(true);
      }
    }

    syncBackendSession();
    return () => {
      cancelled = true;
    };
  }, [isPending, email]);

  const logout = useCallback(async () => {
    try {
      await authClient.signOut();
    } finally {
      try {
        await api.post("/auth/logout");
      } catch {
      }
      clearApiSession();
      setUser(null);
    }
  }, []);

  return {
    user,
    isLoading: isPending || !tokenReady,
    isLoggedIn: Boolean(session && user),
    logout,
    setUser,
  };
}
