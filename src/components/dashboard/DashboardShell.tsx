"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
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
      <div className="min-h-screen bg-[#0b1220] text-gray-100 [color-scheme:dark]">
        <Loader label="Loading your dashboard…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-gray-100 [color-scheme:dark]">
      <DashboardSidebar role={role} user={user} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-64">
        <TopBar />
        <main className="mx-auto w-full max-w-7xl flex-1 bg-[#0b1220] p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
