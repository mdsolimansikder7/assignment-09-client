"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  DashboardMobileMenuButton,
  DashboardSidebar,
} from "@/components/dashboard/Sidebar";
import { Loader } from "@/components/shared/Loader";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";

interface DashboardShellProps {
  role: UserRole;
  children: React.ReactNode;
}

export function DashboardShell({ role, children }: DashboardShellProps) {
  const router = useRouter();
  const { user, isLoading, isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) router.replace("/login");
  }, [isLoading, isLoggedIn, router]);

  if (isLoading || !isLoggedIn || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground">
        <Loader label="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background text-foreground">
      <DashboardSidebar role={role} />
      <main className="min-w-0 flex-1 p-4 md:p-6">
        <DashboardMobileMenuButton role={role} />
        {children}
      </main>
    </div>
  );
}
