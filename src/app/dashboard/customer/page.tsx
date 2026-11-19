"use client";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatCard } from "@/components/dashboard/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { api, getErrorMessage } from "@/lib/api";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";
import { RentalsTable } from "@/components/dashboard/RentalsTable";
import { CalendarClockIcon, CalendarCheckIcon, HourglassIcon, BanknoteIcon } from "lucide-react";
import type { CustomerAnalytics } from "@/types";

export default function CustomerOverviewPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api.get<{ data: CustomerAnalytics }>("/analytics/customer");
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
      <WelcomeBanner name={user?.name || "Customer"} role="customer" />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : error || !analytics ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center">
          <p className="font-medium">Analytics could not be loaded.</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Bookings" value={analytics.totalBookings} Icon={CalendarClockIcon} />
          <StatCard label="Active Rentals" value={analytics.activeRentals} Icon={HourglassIcon} />
          <StatCard label="Completed Rentals" value={analytics.completedRentals} Icon={CalendarCheckIcon} />
          <StatCard label="Total Spent" value={formatCurrency(analytics.totalSpent)} Icon={BanknoteIcon} />
        </div>
      )}

      <div>
        <PageHeader title="Recent Rentals" description="Your latest bookings and rentals." />
        <RentalsTable />
      </div>
    </div>
  );
}