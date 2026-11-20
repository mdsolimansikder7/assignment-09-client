"use client";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatCard } from "@/components/dashboard/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { api, getErrorMessage } from "@/lib/api";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";
import { OwnerRentalsTable } from "@/components/dashboard/OwnerRentalsTable";
import { BoxesIcon, CalendarCheckIcon, TrendingUpIcon, BanknoteIcon } from "lucide-react";
import type { OwnerAnalytics } from "@/types";

export default function OwnerOverviewPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<OwnerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api.get<{ data: OwnerAnalytics }>("/analytics/owner");
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

  const thisMonthEarnings = analytics?.monthly?.length
    ? analytics.monthly[analytics.monthly.length - 1].earnings
    : 0;

  return (
    <div className="space-y-6">
      <WelcomeBanner name={user?.name || "Owner"} role="owner" />

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
          <StatCard label="Listed Equipment" value={analytics.totalEquipment} Icon={BoxesIcon} />
          <StatCard label="Completed Rentals" value={analytics.completedRentals} Icon={CalendarCheckIcon} />
          <StatCard label="Total Earnings" value={formatCurrency(analytics.totalEarnings)} Icon={BanknoteIcon} />
          <StatCard label="Earnings This Month" value={formatCurrency(thisMonthEarnings)} Icon={TrendingUpIcon} />
        </div>
      )}

      <div>
        <PageHeader title="Recent Rentals" description="Latest bookings on your equipment." />
        <OwnerRentalsTable />
      </div>
    </div>
  );
}