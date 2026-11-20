"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BoxesIcon, CheckIcon, EyeIcon, PencilIcon, Trash2Icon, XIcon } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { cn } from "cn";

import { api, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { EquipmentForm, type EquipmentFormValues } from "@/components/equipment/EquipmentForm";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import type { Equipment } from "@/types";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]["value"];

function ActionButtons({
  item,
  busy,
  onApprove,
  onReject,
  onEdit,
  onDelete,
}: {
  item: Equipment;
  busy: boolean;
  onApprove: (item: Equipment) => void;
  onReject: (item: Equipment) => void;
  onEdit: (item: Equipment) => void;
  onDelete: (item: Equipment) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <Link
        href={`/equipment/${item.id}`}
        aria-label={`View ${item.name}`}
        title="View Details"
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "text-muted-foreground hover:text-foreground",
        )}
      >
        <EyeIcon className="size-4" />
      </Link>
      {item.status !== "approved" && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400"
          title="Approve"
          disabled={busy}
          onClick={() => onApprove(item)}
        >
          <CheckIcon className="size-4" />
        </Button>
      )}
      {item.status !== "rejected" && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
          title="Reject"
          disabled={busy}
          onClick={() => onReject(item)}
        >
          <XIcon className="size-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-foreground"
        title="Update"
        disabled={busy}
        onClick={() => onEdit(item)}
      >
        <PencilIcon className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-destructive"
        title="Delete"
        disabled={busy}
        onClick={() => onDelete(item)}
      >
        <Trash2Icon className="size-4" />
      </Button>
    </div>
  );
}

export function AdminEquipmentTable() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = filter === "all" ? "" : `?status=${filter}`;
        const res = await api.get<{ data: Equipment[] }>(`/admin/equipment${params}`);
        if (!cancelled) setEquipment(Array.isArray(res.data?.data) ? res.data.data : []);
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
  }, [filter]);

  const pendingCount = equipment.filter((e) => e.status === "pending").length;

  const setStatus = async (item: Equipment, status: "approved" | "rejected") => {
    setBusyId(item.id);
    try {
      const res = await api.patch<{ data: Equipment }>(`/admin/equipment/${item.id}/status`, { status });
      const updated = res.data?.data;
      if (updated) {
        setEquipment((prev) => prev.map((e) => (e.id === item.id ? updated : e)));
      }
      toast.success(`Equipment ${status}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item: Equipment) => {
    const result = await Swal.fire({
      title: "Delete this equipment?",
      text: `"${item.name}" will be removed permanently.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      confirmButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    setBusyId(item.id);
    try {
      await api.delete(`/equipment/${item.id}`);
      setEquipment((prev) => prev.filter((e) => e.id !== item.id));
      toast.success("Equipment deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleUpdate = async (values: EquipmentFormValues) => {
    if (!editing) return;

    try {
      const res = await api.patch<{ data: Equipment }>(`/equipment/${editing.id}`, values);
      const updated = res.data?.data;
      if (updated) {
        setEquipment((prev) => prev.map((e) => (e.id === editing.id ? updated : e)));
      }
      toast.success("Equipment updated");
      setEditing(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-foreground">Could not load equipment</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {equipment.length} item{equipment.length === 1 ? "" : "s"}
          </p>
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400">
            Pending: {pendingCount}
          </span>
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as StatusFilter)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.value === "pending" ? `Pending (${pendingCount})` : option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : equipment.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <BoxesIcon className="mx-auto size-8 text-muted-foreground/40" />
          <p className="mt-3 font-medium text-foreground">No equipment found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filter === "all" ? "No listings have been submitted yet." : `No ${filter} listings right now.`}
          </p>
        </div>
      ) : (
        <>
          <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-[26%]" />
                <col className="w-[20%]" />
                <col className="w-[14%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[18%]" />
              </colgroup>
              <thead className="bg-card">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Equipment</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Owner Information</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rental Price</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {equipment.map((item) => (
                  <tr key={item.id} className="align-top transition hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="size-10 shrink-0 rounded-md object-cover" />
                        <span className="truncate font-medium text-foreground" title={item.name}>{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="truncate text-foreground" title={item.owner?.name || "—"}>{item.owner?.name || "—"}</p>
                      <p className="truncate text-xs text-muted-foreground" title={item.owner?.email || ""}>{item.owner?.email || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="block truncate" title={item.category}>{item.category}</span>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {formatCurrency(item.rentalPrice)}/{item.rentalType === "daily" ? "day" : item.rentalType === "weekly" ? "week" : "month"}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <ActionButtons
                          item={item}
                          busy={busyId === item.id}
                          onApprove={(i) => setStatus(i, "approved")}
                          onReject={(i) => setStatus(i, "rejected")}
                          onEdit={setEditing}
                          onDelete={handleDelete}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {equipment.map((item) => (
              <div key={item.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="size-14 shrink-0 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-medium text-foreground" title={item.name}>{item.name}</p>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{item.category}</p>
                  </div>
                </div>
                <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <div className="min-w-0">
                    <dt className="text-xs font-medium text-muted-foreground">Owner</dt>
                    <dd className="truncate text-foreground" title={item.owner?.name || "—"}>{item.owner?.name || "—"}</dd>
                    <dd className="truncate text-xs text-muted-foreground" title={item.owner?.email || ""}>{item.owner?.email || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">Rental Price</dt>
                    <dd className="text-foreground">{formatCurrency(item.rentalPrice)}/{item.rentalType === "daily" ? "day" : item.rentalType === "weekly" ? "week" : "month"}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/equipment/${item.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}><EyeIcon className="size-4" /> View Details</Link>
                  {item.status !== "approved" && (
                    <Button variant="outline" size="sm" className="gap-1.5" disabled={busyId === item.id} onClick={() => setStatus(item, "approved")}><CheckIcon className="size-4" /> Approve</Button>
                  )}
                  {item.status !== "rejected" && (
                    <Button variant="outline" size="sm" className="gap-1.5" disabled={busyId === item.id} onClick={() => setStatus(item, "rejected")}><XIcon className="size-4" /> Reject</Button>
                  )}
                  <Button variant="outline" size="sm" className="gap-1.5" disabled={busyId === item.id} onClick={() => setEditing(item)}><PencilIcon className="size-4" /> Update</Button>
                  <Button variant="outline" size="sm" className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive" disabled={busyId === item.id} onClick={() => handleDelete(item)}><Trash2Icon className="size-4" /> Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update equipment</DialogTitle>
            <DialogDescription>Edit this listing as an administrator.</DialogDescription>
          </DialogHeader>
          {editing && (
            <EquipmentForm
              initial={editing}
              submitLabel="Save changes"
              onSubmit={handleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
