"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarSearchIcon } from "lucide-react";

import { api, getErrorMessage } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Booking } from "@/types";

export function OwnerRentalsTable({ onSelect }: { onSelect?: (rental: Booking) => void }) {
  const [rentals, setRentals] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await api.get<{ data: Booking[] }>("/bookings/owner");
        if (!cancelled) setRentals(Array.isArray(res.data?.data) ? res.data.data : []);
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

  if (loading) {
    return (
      <div className="space-y-2 rounded-xl border border-border bg-card">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-12 w-16 rounded-md" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="hidden h-4 w-28 sm:block" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center">
        <p className="font-medium">Rentals could not be loaded.</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (rentals.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
        <CalendarSearchIcon className="mx-auto size-10 text-muted-foreground/60" />
        <p className="mt-3 font-medium">No rentals yet.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Once customers book your equipment, the bookings appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipment</TableHead>
              <TableHead>Txn ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Earnings</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rentals.map((rental, index) => (
              <TableRow key={rental.id ?? `rental-${index}`} onClick={() => onSelect?.(rental)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
                      {rental.equipmentName?.charAt(0)?.toUpperCase() || "G"}
                    </div>
                    <Link
                      href={`/equipment/${rental.equipmentId}`}
                      className="line-clamp-2 max-w-40 font-medium hover:text-primary"
                    >
                      {rental.equipmentName}
                    </Link>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">
                  {rental.transactionId || "-"}
                </TableCell>
                <TableCell>
                  <p className="font-medium">{rental.customer?.name}</p>
                  <p className="text-xs text-muted-foreground">{rental.customer?.email}</p>
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                  {formatDate(rental.startDate)} – {formatDate(rental.endDate)}
                </TableCell>
                <TableCell>{rental.quantity}</TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(rental.totalAmount)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={rental.bookingStatus} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={rental.paymentStatus} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
