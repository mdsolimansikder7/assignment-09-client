"use client";

import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatCard } from "@/components/dashboard/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { api, getErrorMessage } from "@/lib/api";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";
import { AdminRentalsTable } from "@/components/dashboard/AdminRentalsTable";
import { BoxesIcon, CalendarClockIcon, CalendarCheckIcon, BanknoteIcon, UsersIcon, HourglassIcon } from "lucide-react";
import type { AdminAnalytics } from "@/types";

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api.get<{ data: AdminAnalytics }>("/analytics/admin");
        if (!cancelled) setAnalytics(res.data?.data ?? null);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-6">
      <WelcomeBanner name={user?.name || "Admin"} role="admin" />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : error || !analytics ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-10 text-center">
          <p className="font-medium">Analytics could not be loaded.</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total Users" value={analytics.totalUsers} Icon={UsersIcon} />
          <StatCard label="Total Equipment" value={analytics.totalEquipment} Icon={BoxesIcon} />
          <StatCard label="Total Bookings" value={analytics.totalBookings} Icon={CalendarClockIcon} />
          <StatCard label="Pending Approvals" value={analytics.pendingApprovals} Icon={HourglassIcon} />
          <StatCard label="Completed Rentals" value={analytics.completedRentals} Icon={CalendarCheckIcon} />
          <StatCard label="Total Revenue" value={formatCurrency(analytics.totalRevenue)} Icon={BanknoteIcon} />
        </div>
      )}

      <AdminRentalsTable />
    </div>
  );
}