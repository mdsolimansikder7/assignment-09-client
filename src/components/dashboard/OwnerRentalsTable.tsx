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

type ActionType = "active" | "completed" | "cancelled";
type StatusFilter = "all" | "confirmed" | "active" | "completed" | "cancelled";

interface PendingAction {
  booking: Booking;
  action: ActionType;
  label: string;
  description: string;
}

function periodDays(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff + 1 : 0;
}

function getActions(booking: Booking): { action: ActionType; label: string }[] {
  const actions: { action: ActionType; label: string }[] = [];
  if (booking.bookingStatus === "confirmed") {
    actions.push({ action: "active", label: "Mark Active" });
  }
  if (booking.bookingStatus === "active") {
    actions.push({ action: "completed", label: "Mark Completed" });
  }
  if (
    (booking.bookingStatus === "pending" || booking.bookingStatus === "confirmed") &&
    booking.paymentStatus !== "paid"
  ) {
    actions.push({ action: "cancelled", label: "Cancel" });
  }
  return actions;
}

function actionDescription(booking: Booking, action: ActionType) {
  const base = `Equipment: ${booking.equipmentName}. Customer: ${booking.customer?.name || "—"}.`;
  if (action === "active") return `${base} This will mark the rental as active (handed over).`;
  if (action === "completed") return `${base} This will mark the rental as completed and notify the customer.`;
  return `${base} This will cancel the booking.`;
}

export function OwnerRentalsTable() {
  const [rentals, setRentals] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

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
    const completed = rentals.filter((r) => r.bookingStatus === "completed").length;
    const cancelled = rentals.filter((r) => r.bookingStatus === "cancelled").length;
    return { active, toHandOver, completed, cancelled, total: rentals.length };
  }, [rentals]);

  const openAction = (booking: Booking, action: ActionType, label: string) => {
    setPendingAction({
      booking,
      action,
      label,
      description: actionDescription(booking, action),
    });
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    const { booking, action } = pendingAction;
    setActingId(booking.id);
    try {
      const res = await api.patch<{ data: Booking }>(`/bookings/${booking.id}/owner-status`, {
        bookingStatus: action,
      });
      const updated = res.data?.data;
      if (updated) {
        setRentals((prev) => prev.map((r) => (r.id === booking.id ? { ...r, ...updated } : r)));
      } else {
        setRentals((prev) =>
          prev.map((r) => (r.id === booking.id ? { ...r, bookingStatus: action as BookingStatus } : r)),
        );
      }
      toast.success(`Booking marked as ${action}`);
      setPendingAction(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActingId(null);
    }
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {summary.active} active, {summary.toHandOver} to hand over, {summary.completed} completed, {summary.cancelled} cancelled
          </p>
        </div>
        <div className="w-full sm:w-56">
          <Select value={filter} onValueChange={(v) => setFilter(v as StatusFilter)}>
            <SelectTrigger className="w-full border-border bg-card text-foreground">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
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
          <p className="mt-3 font-medium text-foreground">No rentals found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {rentals.length === 0
              ? "Bookings for your equipment will appear here."
              : "No rentals match the selected status filter."}
          </p>
        </div>
      ) : (
        <>
          <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-[18%]" />
                <col className="w-[17%]" />
                <col className="w-[14%]" />
                <col className="w-[8%]" />
                <col className="w-[11%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead className="bg-card">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer Information</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Equipment Information</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rental Duration</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Required Quantity</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Booking Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Payment Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Booking Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((rental) => {
                  const days = periodDays(rental.startDate, rental.endDate);
                  const actions = getActions(rental);
                  const busy = actingId === rental.id;
                  return (
                    <tr key={rental.id} className="align-top transition hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground" title={rental.customer?.name || "—"}>
                            {rental.customer?.name || "—"}
                          </p>
                          <p className="truncate text-xs text-muted-foreground" title={rental.customer?.email || ""}>
                            {rental.customer?.email || "—"}
                          </p>
                          {rental.customer?.phone ? (
                            <p className="truncate text-xs text-muted-foreground" title={rental.customer.phone}>
                              {rental.customer.phone}
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="truncate font-medium text-foreground" title={rental.equipmentName}>
                          {rental.equipmentName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground" title={rental.equipmentId}>
                          ID: {rental.equipmentId}
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
                      <td className="px-4 py-3 text-foreground">{rental.quantity}</td>
                      <td className="px-4 py-3 text-foreground">{formatCurrency(rental.totalAmount)}</td>
                      <td className="px-4 py-3"><StatusBadge status={rental.paymentStatus} /></td>
                      <td className="px-4 py-3"><StatusBadge status={rental.bookingStatus} /></td>
                      <td className="px-4 py-3">
                        {actions.length === 0 ? (
                          <span className="text-muted-foreground">-</span>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {actions.map((item) => (
                              <Button
                                key={item.action}
                                type="button"
                                size="sm"
                                variant={item.action === "cancelled" ? "outline" : "default"}
                                className={
                                  item.action === "cancelled"
                                    ? "w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    : "w-full bg-primary text-primary-foreground hover:bg-primary-hover"
                                }
                                disabled={busy}
                                onClick={() => openAction(rental, item.action, item.label)}
                              >
                                {busy ? "..." : item.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((rental) => {
              const days = periodDays(rental.startDate, rental.endDate);
              const actions = getActions(rental);
              const busy = actingId === rental.id;
              return (
                <div key={rental.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground" title={rental.equipmentName}>
                        {rental.equipmentName}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Equipment ID: {rental.equipmentId}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <StatusBadge status={rental.bookingStatus} />
                      <StatusBadge status={rental.paymentStatus} />
                    </div>
                  </div>

                  <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    <div className="min-w-0">
                      <dt className="text-xs font-medium text-muted-foreground">Customer Information</dt>
                      <dd className="truncate text-foreground" title={rental.customer?.name || "—"}>{rental.customer?.name || "—"}</dd>
                      <dd className="truncate text-xs text-muted-foreground" title={rental.customer?.email || ""}>{rental.customer?.email || "—"}</dd>
                      {rental.customer?.phone ? (
                        <dd className="truncate text-xs text-muted-foreground" title={rental.customer.phone}>{rental.customer.phone}</dd>
                      ) : null}
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
                      <dt className="text-xs font-medium text-muted-foreground">Required Quantity</dt>
                      <dd className="text-foreground">{rental.quantity}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-muted-foreground">Booking Amount</dt>
                      <dd className="font-medium text-foreground">{formatCurrency(rental.totalAmount)}</dd>
                    </div>
                  </dl>

                  <div className="mt-4 border-t border-border pt-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Action</p>
                    {actions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">-</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {actions.map((item) => (
                          <Button
                            key={item.action}
                            type="button"
                            size="sm"
                            variant={item.action === "cancelled" ? "outline" : "default"}
                            className={
                              item.action === "cancelled"
                                ? "border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                : "bg-primary text-primary-foreground hover:bg-primary-hover"
                            }
                            disabled={busy}
                            onClick={() => openAction(rental, item.action, item.label)}
                          >
                            {busy ? "..." : item.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <Dialog open={!!pendingAction} onOpenChange={(open) => !open && !actingId && setPendingAction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{pendingAction?.label || "Confirm action"}</DialogTitle>
            <DialogDescription className="whitespace-pre-line">
              {pendingAction?.description || "Are you sure you want to continue?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingAction(null)}
              disabled={!!actingId}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmAction}
              disabled={!!actingId || !pendingAction}
              className={
                pendingAction?.action === "cancelled"
                  ? "border-destructive/30 bg-destructive text-white hover:bg-destructive/90"
                  : "bg-primary text-primary-foreground hover:bg-primary-hover"
              }
            >
              {actingId ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
