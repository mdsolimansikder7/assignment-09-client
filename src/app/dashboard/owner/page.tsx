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
import { BanknoteIcon, BoxesIcon, CalendarCheckIcon } from "lucide-react";

import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatCard } from "@/components/dashboard/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { api, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
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
        earnings: item.earnings || 0,
      })),
    [analytics],
  );

  return (
    <div className="space-y-6">
      {user && <WelcomeBanner name={user.name} role="owner" />}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total Listed Equipment" value={analytics?.totalEquipment ?? 0} Icon={BoxesIcon} />
            <StatCard label="Completed Rentals" value={analytics?.completedRentals ?? 0} Icon={CalendarCheckIcon} />
            <StatCard label="Total Earnings" value={formatCurrency(analytics?.totalEarnings ?? 0)} Icon={BanknoteIcon} />
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">Monthly Earnings</h2>
              <p className="text-sm text-muted-foreground">Earnings from your equipment rentals by month</p>
            </div>
            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No earnings data available yet.</p>
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
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                      axisLine={{ stroke: "var(--border)" }}
                      tickLine={false}
                      width={48}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--muted)" }}
                      formatter={(value) => [formatCurrency(Number(value || 0)), "Earnings"]}
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.75rem",
                        color: "var(--foreground)",
                      }}
                      labelStyle={{ color: "var(--foreground)" }}
                    />
                    <Bar dataKey="earnings" name="Earnings" fill="var(--primary)" radius={[6, 6, 0, 0]} />
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
