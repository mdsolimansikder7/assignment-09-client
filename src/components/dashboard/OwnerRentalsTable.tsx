"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarSearchIcon } from "lucide-react";
import toast from "react-hot-toast";

import { api, getErrorMessage } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Booking, BookingStatus } from "@/types";

type StatusFilter = "all" | "confirmed" | "active" | "completed" | "cancelled";

const FILTER_LABELS: Record<StatusFilter, string> = {
  all: "All",
  confirmed: "Confirmed",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

interface PendingStatusChange {
  booking: Booking;
  nextStatus: BookingStatus;
}

function periodDays(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff + 1 : 0;
}

function getOwnerNextStatuses(booking: Booking): BookingStatus[] {
  const next: BookingStatus[] = [];
  if (booking.bookingStatus === "confirmed") next.push("active");
  if (booking.bookingStatus === "active") next.push("completed");
  if (
    (booking.bookingStatus === "pending" || booking.bookingStatus === "confirmed") &&
    booking.paymentStatus !== "paid"
  ) {
    next.push("cancelled");
  }
  return next;
}

function paymentPillClass(status: string) {
  const value = status.toLowerCase();
  if (value === "paid") {
    return "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/15 dark:text-green-400";
  }
  if (value === "pending" || value === "unpaid") {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400";
  }
  return "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-400";
}

function PaymentPill({ status }: { status: string }) {
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : "—";
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${paymentPillClass(status)}`}
    >
      {label}
    </span>
  );
}

function bookingPillClass(status: string) {
  const value = status.toLowerCase();
  if (value === "completed" || value === "active" || value === "confirmed") {
    return "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/15 dark:text-green-400";
  }
  if (value === "pending") {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400";
  }
  return "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-400";
}

function BookingReadOnlyPill({ status }: { status: string }) {
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : "—";
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${bookingPillClass(status)}`}
    >
      {label}
    </span>
  );
}

function statusLabel(status: string) {
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : status;
}

function confirmText(booking: Booking, nextStatus: BookingStatus) {
  const base = `Equipment: ${booking.equipmentName}\nCustomer: ${booking.customer?.name || "—"} (${booking.customer?.email || "—"})`;
  if (nextStatus === "active") return `${base}\n\nMark this rental as Active?`;
  if (nextStatus === "completed") return `${base}\n\nMark this rental as Completed? The customer will be notified.`;
  return `${base}\n\nCancel this booking? This action cannot be undone.`;
}

export function OwnerRentalsTable() {
  const [rentals, setRentals] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [pendingChange, setPendingChange] = useState<PendingStatusChange | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  const filtered = useMemo(() => {
    if (filter === "all") return rentals;
    return rentals.filter((r) => r.bookingStatus === filter);
  }, [rentals, filter]);

  const summary = useMemo(() => {
    const active = rentals.filter((r) => r.bookingStatus === "active").length;
    const toHandOver = rentals.filter((r) => r.bookingStatus === "confirmed").length;
    return { active, toHandOver };
  }, [rentals]);

  const requestStatusChange = (booking: Booking, nextStatus: BookingStatus) => {
    if (nextStatus === booking.bookingStatus) return;
    setPendingChange({ booking, nextStatus });
  };

  const confirmStatusChange = async () => {
    if (!pendingChange) return;
    const { booking, nextStatus } = pendingChange;
    setUpdatingId(booking.id);
    try {
      const res = await api.patch<{ data: Booking }>(`/bookings/${booking.id}/owner-status`, {
        bookingStatus: nextStatus,
      });
      const updated = res.data?.data;
      setRentals((prev) =>
        prev.map((r) => (r.id === booking.id ? { ...r, ...(updated || {}), bookingStatus: updated?.bookingStatus || nextStatus } : r)),
      );
      toast.success(`Booking marked as ${nextStatus}`);
      setPendingChange(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const renderBookingStatusControl = (rental: Booking) => {
    const nextStatuses = getOwnerNextStatuses(rental);
    const isTerminal = rental.bookingStatus === "completed" || rental.bookingStatus === "cancelled";
    if (isTerminal || nextStatuses.length === 0) {
      return <BookingReadOnlyPill status={rental.bookingStatus} />;
    }

    return (
      <Select
        value={rental.bookingStatus}
        onValueChange={(v) => requestStatusChange(rental, v as BookingStatus)}
        disabled={updatingId === rental.id}
      >
        <SelectTrigger
          size="sm"
          className="w-full rounded-lg border border-border bg-card px-3 text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="truncate">{statusLabel(rental.bookingStatus)}</span>
        </SelectTrigger>
        <SelectContent side="bottom" align="start" sideOffset={4} alignItemWithTrigger={false} className="z-[60]">
          {nextStatuses.map((status) => (
            <SelectItem key={status} value={status}>
              {statusLabel(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {summary.active} active, {summary.toHandOver} to hand over
        </p>
        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          <span className="text-sm font-medium text-foreground">Status</span>
          <Select value={filter} onValueChange={(v) => setFilter(v as StatusFilter)}>
            <SelectTrigger className="w-full rounded-lg border border-border bg-card text-foreground sm:w-44">
              <span className="truncate">{FILTER_LABELS[filter]}</span>
            </SelectTrigger>
            <SelectContent side="bottom" align="start" sideOffset={4} alignItemWithTrigger={false} className="z-[60]">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <CalendarSearchIcon className="mx-auto size-8 text-muted-foreground/40" />
          <p className="mt-3 font-medium text-foreground">No rentals yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">Bookings for your equipment will appear here.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block w-full rounded-xl border border-border bg-card">
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-[18%]" />
                <col className="w-[22%]" />
                <col className="w-[16%]" />
                <col className="w-[8%]" />
                <col className="w-[12%]" />
                <col className="w-[9%]" />
                <col className="w-[150px] min-w-[150px]" />
              </colgroup>
              <thead className="bg-card">
                <tr className="border-b border-border">
                  <th className="px-4 py-4 text-left font-medium text-muted-foreground">Customer Information</th>
                  <th className="px-4 py-4 text-left font-medium text-muted-foreground">Equipment Name</th>
                  <th className="px-4 py-4 text-left font-medium text-muted-foreground">Rental Duration</th>
                  <th className="px-4 py-4 text-left font-medium text-muted-foreground">Qty</th>
                  <th className="px-4 py-4 text-left font-medium text-muted-foreground">Booking Amount</th>
                  <th className="px-4 py-4 text-left font-medium text-muted-foreground">Payment Status</th>
                  <th className="px-4 py-4 pr-4 text-left font-medium text-muted-foreground w-[150px] min-w-[150px]">Booking Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((rental) => {
                  const days = periodDays(rental.startDate, rental.endDate);
                  return (
                    <tr key={rental.id} className="align-top transition hover:bg-muted/40">
                      <td className="px-4 py-4">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground" title={rental.customer?.name || "—"}>
                            {rental.customer?.name || "—"}
                          </p>
                          <p className="truncate text-xs text-muted-foreground" title={rental.customer?.email || ""}>
                            {rental.customer?.email || "—"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-3 min-w-0">
                          {rental.equipmentImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={rental.equipmentImage}
                              alt={rental.equipmentName}
                              className="size-10 shrink-0 rounded-md border border-border bg-muted object-cover"
                            />
                          ) : (
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-xs font-medium text-muted-foreground">
                              {rental.equipmentName?.charAt(0)?.toUpperCase() || "E"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground" title={rental.equipmentName}>
                              {rental.equipmentName}
                            </p>
                            {rental.transactionId ? (
                              <p className="truncate text-xs text-muted-foreground" title={rental.transactionId}>
                                Txn: {rental.transactionId}
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground">Txn: —</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-foreground">
                        <div className="whitespace-normal leading-snug">
                          <span className="block">{formatDate(rental.startDate)}</span>
                          <span className="block text-muted-foreground">to {formatDate(rental.endDate)}</span>
                          {days > 0 && (
                            <span className="mt-0.5 block text-xs text-muted-foreground">({days} day{days === 1 ? "" : "s"})</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-foreground">{rental.quantity}</td>
                      <td className="px-4 py-4 font-medium text-foreground">{formatCurrency(rental.totalAmount)}</td>
                      <td className="px-4 py-4"><PaymentPill status={rental.paymentStatus} /></td>
                      <td className="w-[150px] min-w-[150px] px-4 py-4 pr-4">{renderBookingStatusControl(rental)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((rental) => {
              const days = periodDays(rental.startDate, rental.endDate);
              const isTerminal = rental.bookingStatus === "completed" || rental.bookingStatus === "cancelled";
              return (
                <div key={rental.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      {rental.equipmentImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={rental.equipmentImage}
                          alt={rental.equipmentName}
                          className="size-12 shrink-0 rounded-md object-cover border border-border bg-muted"
                        />
                      ) : (
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-sm font-medium text-muted-foreground">
                          {rental.equipmentName?.charAt(0)?.toUpperCase() || "E"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground" title={rental.equipmentName}>{rental.equipmentName}</p>
                        <p className="truncate text-xs text-muted-foreground" title={rental.transactionId || ""}>
                          Txn: {rental.transactionId || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="w-36 shrink-0">
                      {isTerminal || getOwnerNextStatuses(rental).length === 0 ? (
                        <div className="flex justify-end"><BookingReadOnlyPill status={rental.bookingStatus} /></div>
                      ) : (
                        renderBookingStatusControl(rental)
                      )}
                    </div>
                  </div>

                  <dl className="mt-3 grid grid-cols-1 gap-2 text-sm">
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
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">Qty</dt>
                        <dd className="text-foreground">{rental.quantity}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">Amount</dt>
                        <dd className="font-medium text-foreground">{formatCurrency(rental.totalAmount)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">Payment</dt>
                        <dd className="mt-0.5"><PaymentPill status={rental.paymentStatus} /></dd>
                      </div>
                    </div>
                  </dl>
                </div>
              );
            })}
          </div>
        </>
      )}

      <Dialog open={!!pendingChange} onOpenChange={(open) => !open && !updatingId && setPendingChange(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm status change</DialogTitle>
            <DialogDescription className="whitespace-pre-line">
              {pendingChange ? confirmText(pendingChange.booking, pendingChange.nextStatus) : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingChange(null)} disabled={!!updatingId}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmStatusChange}
              disabled={!!updatingId || !pendingChange}
              className={
                pendingChange?.nextStatus === "cancelled"
                  ? "bg-destructive text-white hover:bg-destructive/90"
                  : "bg-primary text-primary-foreground hover:bg-primary-hover"
              }
            >
              {updatingId ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
