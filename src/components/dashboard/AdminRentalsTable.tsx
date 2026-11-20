"use client";

import { useEffect, useState } from "react";
import { CalendarSearchIcon } from "lucide-react";
import toast from "react-hot-toast";

import { api, getErrorMessage } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Booking, BookingStatus } from "@/types";

const BOOKING_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "active",
  "completed",
  "cancelled",
];

function periodDays(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff + 1 : 0;
}

export function AdminRentalsTable() {
  const [rentals, setRentals] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await api.get<{ data: Booking[] }>("/admin/bookings");
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

  const handleStatusChange = async (id: string, bookingStatus: BookingStatus) => {
    setUpdatingId(id);
    try {
      const res = await api.patch<{ data: Booking }>(`/admin/bookings/${id}`, { bookingStatus });
      const updated = res.data?.data;
      if (updated) {
        setRentals((prev) => prev.map((r) => (r.id === id ? updated : r)));
      }
      toast.success("Booking status updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-foreground">Could not load rentals</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (rentals.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
        <CalendarSearchIcon className="mx-auto size-8 text-muted-foreground/40" />
        <p className="mt-3 font-medium text-foreground">No rentals yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform bookings will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col className="w-[18%]" />
            <col className="w-[18%]" />
            <col className="w-[16%]" />
            <col className="w-[14%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead className="bg-card">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer Information</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Owner Information</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Equipment Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rental Duration</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Booking Amount</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Payment Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Booking Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rentals.map((rental) => {
              const days = periodDays(rental.startDate, rental.endDate);
              return (
                <tr key={rental.id} className="align-top transition hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <p className="truncate font-medium text-foreground" title={rental.customer?.name || "—"}>
                      {rental.customer?.name || "—"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground" title={rental.customer?.email || ""}>
                      {rental.customer?.email || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="truncate text-foreground" title={rental.ownerEmail || "—"}>
                      {rental.ownerEmail || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="truncate font-medium text-foreground" title={rental.equipmentName}>
                      {rental.equipmentName}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    <div className="whitespace-normal leading-snug">
                      <span className="block">{formatDate(rental.startDate)}</span>
                      <span className="block text-muted-foreground">to {formatDate(rental.endDate)}</span>
                      {days > 0 && (
                        <span className="mt-0.5 block text-xs text-muted-foreground">({days} day{days === 1 ? "" : "s"})</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground">{formatCurrency(rental.totalAmount)}</td>
                  <td className="px-4 py-3"><StatusBadge status={rental.paymentStatus} /></td>
                  <td className="px-4 py-3">
                    <Select
                      value={rental.bookingStatus}
                      onValueChange={(v) => handleStatusChange(rental.id, v as BookingStatus)}
                      disabled={updatingId === rental.id}
                    >
                      <SelectTrigger
                        size="sm"
                        className="w-full min-w-0 rounded-md border-border bg-card text-foreground capitalize disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BOOKING_STATUSES.map((status) => (
                          <SelectItem key={status} value={status} className="capitalize">
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {rentals.map((rental) => {
          const days = periodDays(rental.startDate, rental.endDate);
          return (
            <div key={rental.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground" title={rental.equipmentName}>{rental.equipmentName}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground" title={rental.ownerEmail}>Owner: {rental.ownerEmail || "—"}</p>
                </div>
                <StatusBadge status={rental.paymentStatus} />
              </div>

              <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-muted-foreground">Customer Information</dt>
                  <dd className="truncate text-foreground" title={rental.customer?.name || "—"}>{rental.customer?.name || "—"}</dd>
                  <dd className="truncate text-xs text-muted-foreground" title={rental.customer?.email || ""}>{rental.customer?.email || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Rental Duration</dt>
                  <dd className="whitespace-normal leading-snug text-foreground">
                    <span className="block">{formatDate(rental.startDate)}</span>
                    <span className="block text-muted-foreground">to {formatDate(rental.endDate)}</span>
                    {days > 0 && <span className="block text-xs text-muted-foreground">({days} day{days === 1 ? "" : "s"})</span>}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Booking Amount</dt>
                  <dd className="font-medium text-foreground">{formatCurrency(rental.totalAmount)}</dd>
                </div>
                <div>
                  <dt className="mb-1 text-xs font-medium text-muted-foreground">Booking Status</dt>
                  <dd>
                    <Select
                      value={rental.bookingStatus}
                      onValueChange={(v) => handleStatusChange(rental.id, v as BookingStatus)}
                      disabled={updatingId === rental.id}
                    >
                      <SelectTrigger
                        size="sm"
                        className="w-full min-w-0 rounded-md border-border bg-card text-foreground capitalize"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BOOKING_STATUSES.map((status) => (
                          <SelectItem key={status} value={status} className="capitalize">
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>
    </>
  );
}
