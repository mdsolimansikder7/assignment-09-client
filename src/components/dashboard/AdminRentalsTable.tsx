"use client";

import { useEffect, useState } from "react";
import { CalendarSearchIcon } from "lucide-react";
import toast from "react-hot-toast";

import { api, getErrorMessage } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
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

const STATUS_PILL_STYLES: Record<string, string> = {
  pending: "border-amber-500/30 bg-amber-500/15 text-amber-400",
  active: "border-blue-500/30 bg-blue-500/15 text-blue-400",
  completed: "border-green-500/30 bg-green-500/15 text-green-400",
  cancelled: "border-red-500/30 bg-red-500/15 text-red-400",
  confirmed: "border-green-500/30 bg-green-500/15 text-green-400",
};

interface AdminRentalsTableProps {
  onSelect?: (rental: Booking) => void;
  title?: string;
  description?: string;
}

export function AdminRentalsTable({
  onSelect,
  title = "Recent Rentals",
  description = "Latest bookings across the platform.",
}: AdminRentalsTableProps) {
  const [rentals, setRentals] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleStatusChange = async (booking: Booking, status: BookingStatus) => {
    if (status === booking.bookingStatus) return;
    try {
      await api.patch(`/admin/bookings/${booking.id}`, { bookingStatus: status });
      setRentals((prev) =>
        prev.map((item) => (item.id === booking.id ? { ...item, bookingStatus: status } : item))
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const renderStatusSelect = (rental: Booking, align: "left" | "right" = "left") => (
    <Select
      value={rental.bookingStatus}
      onValueChange={(value) =>
        handleStatusChange(rental, (value ?? "pending") as BookingStatus)
      }
    >
      <SelectTrigger
        className={`h-8 w-[130px] rounded-full border px-3 py-1 text-xs font-medium capitalize ${
          STATUS_PILL_STYLES[rental.bookingStatus] ??
          "border-white/10 bg-white/5 text-gray-300"
        } ${align === "right" ? "ml-auto" : ""}`}
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
  );

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="text-sm text-gray-400">{description}</p>
      </div>

      {loading ? (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-t border-white/5 px-5 py-4 first:border-t-0">
              <Skeleton className="h-10 w-40 bg-white/10" />
              <Skeleton className="h-10 flex-1 bg-white/10" />
              <Skeleton className="hidden h-10 w-32 bg-white/10 md:block" />
              <Skeleton className="h-8 w-24 bg-white/10" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-10 text-center">
          <p className="font-medium text-white">Rentals could not be loaded.</p>
          <p className="mt-1 text-sm text-gray-400">{error}</p>
        </div>
      ) : rentals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#111827] p-12 text-center">
          <CalendarSearchIcon className="mx-auto size-10 text-gray-500" />
          <p className="mt-3 font-medium text-white">No bookings yet.</p>
          <p className="mt-1 text-sm text-gray-400">
            Bookings will appear here as soon as customers start renting.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-[#111827] md:block">
            <table className="w-full table-fixed text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="w-[26%] px-5 py-3 font-medium">Equipment</th>
                  <th className="w-[20%] px-5 py-3 font-medium">Customer</th>
                  <th className="w-[17%] px-5 py-3 font-medium">Owner</th>
                  <th className="w-[17%] px-5 py-3 font-medium">Period</th>
                  <th className="w-[8%] px-5 py-3 text-right font-medium">Total</th>
                  <th className="w-[12%] px-5 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map((rental, index) => {
                  const txn = rental.transactionId || "-";
                  return (
                    <tr
                      key={rental.id ?? `rental-${index}`}
                      onClick={() => onSelect?.(rental)}
                      className="border-t border-white/5 transition hover:bg-white/5"
                    >
                      <td className="px-5 py-4 align-middle">
                        <p className="truncate font-medium text-white" title={rental.equipmentName}>
                          {rental.equipmentName}
                        </p>
                        <p
                          className="truncate text-xs text-gray-400"
                          title={txn}
                        >
                          {txn}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <p className="truncate text-white" title={rental.customer?.name || ""}>
                          {rental.customer?.name || "-"}
                        </p>
                        <p
                          className="truncate text-xs text-gray-400"
                          title={rental.customer?.email || ""}
                        >
                          {rental.customer?.email || "-"}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <p className="truncate text-gray-300" title={rental.ownerEmail || ""}>
                          {rental.ownerEmail || "-"}
                        </p>
                      </td>
                      <td className="px-5 py-4 align-middle text-gray-300">
                        <p>{formatDate(rental.startDate)}</p>
                        <p className="text-xs text-gray-400">{formatDate(rental.endDate)}</p>
                      </td>
                      <td className="px-5 py-4 text-right align-middle font-semibold text-white">
                        {formatCurrency(rental.totalAmount)}
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <div className="flex justify-end">
                          {renderStatusSelect(rental, "right")}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {rentals.map((rental, index) => {
              const txn = rental.transactionId || "-";
              return (
                <div
                  key={rental.id ?? `rental-mobile-${index}`}
                  onClick={() => onSelect?.(rental)}
                  className="rounded-2xl border border-white/10 bg-[#111827] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-white" title={rental.equipmentName}>
                        {rental.equipmentName}
                      </p>
                      <p className="truncate text-xs text-gray-400" title={txn}>
                        Txn: {txn}
                      </p>
                    </div>
                    <div className="shrink-0">{renderStatusSelect(rental)}</div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-400">Customer</span>
                      <div className="min-w-0 text-right">
                        <p className="truncate text-white">{rental.customer?.name || "-"}</p>
                        <p className="truncate text-xs text-gray-400">{rental.customer?.email || "-"}</p>
                      </div>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-400">Owner</span>
                      <span className="truncate text-right text-gray-300" title={rental.ownerEmail || ""}>
                        {rental.ownerEmail || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-400">Period</span>
                      <span className="text-right text-gray-300">
                        {formatDate(rental.startDate)} – {formatDate(rental.endDate)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-400">Total</span>
                      <span className="font-semibold text-white">{formatCurrency(rental.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
