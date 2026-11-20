"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BanknoteIcon,
  BoxesIcon,
  CalendarCheckIcon,
  CalendarClockIcon,
  HourglassIcon,
  UsersIcon,
} from "lucide-react";

import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatCard } from "@/components/dashboard/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { api, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
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
        if (!cancelled) setAnalytics(res.data?.data || null);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = useMemo(
    () =>
      (analytics?.monthly || []).map((item) => ({
        name: `${item.month} ${String(item.year).slice(-2)}`,
        bookings: item.bookings || 0,
      })),
    [analytics],
  );

  return (
    <div className="space-y-6">
      {user && <WelcomeBanner name={user.name} role="admin" />}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total Users" value={analytics?.totalUsers ?? 0} Icon={UsersIcon} />
            <StatCard label="Total Equipment" value={analytics?.totalEquipment ?? 0} Icon={BoxesIcon} />
            <StatCard label="Total Bookings" value={analytics?.totalBookings ?? 0} Icon={CalendarClockIcon} />
            <StatCard label="Pending Approvals" value={analytics?.pendingApprovals ?? 0} Icon={HourglassIcon} />
            <StatCard label="Completed Rentals" value={analytics?.completedRentals ?? 0} Icon={CalendarCheckIcon} />
            <StatCard label="Total Revenue" value={formatCurrency(analytics?.totalRevenue ?? 0)} Icon={BanknoteIcon} />
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">Monthly Bookings</h2>
              <p className="text-sm text-muted-foreground">Bookings created per month</p>
            </div>
            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No booking data available yet.</p>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                      axisLine={{ stroke: "var(--border)" }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                      axisLine={{ stroke: "var(--border)" }}
                      tickLine={false}
                      width={32}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--muted)" }}
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.75rem",
                        color: "var(--foreground)",
                      }}
                      labelStyle={{ color: "var(--foreground)" }}
                    />
                    <Bar dataKey="bookings" name="Bookings" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
