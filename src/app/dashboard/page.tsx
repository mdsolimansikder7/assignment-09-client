"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Loader } from "@/components/shared/Loader";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardIndexPage() {
  const router = useRouter();
  const { user, isLoading, isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }
    const role = user?.role ?? "customer";
    router.replace(
      role === "owner"
        ? "/dashboard/owner"
        : role === "customer"
          ? "/dashboard/customer"
          : `/dashboard/${role}`
    );
  }, [isLoading, isLoggedIn, user, router]);

  return <Loader />;
}
