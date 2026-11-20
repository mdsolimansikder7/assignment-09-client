"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PartyPopperIcon, ShieldCheckIcon } from "lucide-react";

import { api, getErrorMessage } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Loader } from "@/components/shared/Loader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import type { Booking } from "@/types";

function SuccessView() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [booking, setBooking] = useState<Booking | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(sessionId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!sessionId) {
        setError("No payment session found. Please start a new booking.");
        setLoading(false);
        return;
      }
      try {
        const res = await api.get<{
          data: {
            booking: Booking;
            transactionId: string;
            amount: number;
            currency: string;
            paymentStatus: string;
            paidAt: string | null;
            equipmentName: string;
            startDate: string;
            endDate: string;
            quantity: number;
            bookingId: string;
          };
        }>(`/payments/verify/${sessionId}`);
        if (!cancelled) {
          setBooking(res.data?.data?.booking ?? null);
          setTransactionId(res.data?.data?.transactionId ?? null);
        }
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
  }, [sessionId]);

  if (loading) return <Loader label="Confirming your payment…" />;

  if (error || !booking) {
    return (
      <div className="container-page max-w-xl py-20 text-center">
        <p className="font-medium">We could not confirm this payment.</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        <Button
          variant="outline"
          className="mt-5"
          nativeButton={false}
          render={<Link href="/equipment" />}
        >
          Browse Equipment
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container-page flex min-h-[70vh] max-w-xl items-center py-16">
          <Card className="w-full text-center">
            <CardHeader>
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <PartyPopperIcon className="size-7" />
              </div>
              <CardTitle className="mt-3 font-heading text-3xl">
                Payment Successful!
              </CardTitle>
              <CardDescription>
                Your booking is confirmed. The owner has been notified.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 rounded-xl bg-secondary p-4 text-left">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{booking.equipmentName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(booking.startDate)} – {formatDate(booking.endDate)} · Qty{" "}
                    {booking.quantity}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-heading text-lg font-bold text-primary">
                    {formatCurrency(booking.totalAmount)}
                  </span>
                  <StatusBadge status={booking.paymentStatus} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-4">
                <div className="rounded-xl border border-border bg-card p-3">
                  <p className="text-xs font-medium text-muted-foreground">Transaction ID</p>
                  <p className="font-mono text-sm break-all">{transactionId || "-"}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <p className="text-xs font-medium text-muted-foreground">Amount</p>
                  <p className="font-medium">{formatCurrency(booking.totalAmount)}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <p className="text-xs font-medium text-muted-foreground">Status</p>
                  <StatusBadge status={booking.paymentStatus} />
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <p className="text-xs font-medium text-muted-foreground">Booking ID</p>
                  <p className="font-mono text-sm break-all">{booking.id.slice(0, 8)}...</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary-hover"
                  nativeButton={false}
                  render={<Link href="/dashboard/customer/my-rentals" />}
                >
                  <ShieldCheckIcon className="size-4" />
                  View My Rentals
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  nativeButton={false}
                  render={<Link href="/equipment" />}
                >
                  Keep Browsing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<Loader />}>
      <SuccessView />
    </Suspense>
  );
}