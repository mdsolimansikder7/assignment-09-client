"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BoxesIcon, CheckIcon, EyeIcon, PencilIcon, Trash2Icon, XIcon } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

import { api, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { EquipmentForm, type EquipmentFormValues } from "@/components/equipment/EquipmentForm";
import { Button } from "@/components/ui/button";
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
];

export function AdminEquipmentTable() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [saving, setSaving] = useState(false);

  async function fetchEquipment(status: string) {
    const res = await api.get<{ data: Equipment[] }>("/admin/equipment", {
      params: status !== "all" ? { status } : undefined,
    });
    setEquipment(Array.isArray(res.data?.data) ? res.data.data : []);
  }

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      try {
        await fetchEquipment(statusFilter);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    initialLoad();
    return () => {
      cancelled = true;
    };
  }, [statusFilter]);

  const handleStatus = async (item: Equipment, status: "approved" | "rejected") => {
    try {
      await api.patch(`/admin/equipment/${item.id}/status`, { status });
      setEquipment((prev) =>
        statusFilter === "all"
          ? prev.map((eq) => (eq.id === item.id ? { ...eq, status } : eq))
          : prev.filter((eq) => eq.id !== item.id)
      );
      toast.success(
        status === "approved"
          ? `"${item.name}" is now live.`
          : `"${item.name}" was rejected.`
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleUpdate = async (values: EquipmentFormValues) => {
    if (!editing) return;
    setSaving(true);
    try {
      await api.put(`/equipment/${editing.id}`, values);
      toast.success("Equipment updated!");
      setEditing(null);
      await fetchEquipment(statusFilter);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Equipment) => {
    const result = await Swal.fire({
      title: "Delete this equipment?",
      text: `"${item.name}" will be removed permanently.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F97316",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, delete it",
    });
    if (!result.isConfirmed) return;

    try {
      await api.delete(`/equipment/${item.id}`);
      setEquipment((prev) => prev.filter((eq) => eq.id !== item.id));
      toast.success("Equipment deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="w-44">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-t border-border px-5 py-4 first:border-t-0">
              <Skeleton className="h-12 w-16 rounded-md bg-muted/50" />
              <Skeleton className="h-10 flex-1 bg-muted/50" />
              <Skeleton className="hidden h-8 w-28 bg-muted/50 md:block" />
              <Skeleton className="h-8 w-32 bg-muted/50" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-10 text-center">
        <p className="font-medium text-foreground">Equipment could not be loaded.</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
          <SelectTrigger className="h-10 w-44 rounded-lg border border-border bg-transparent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {equipment.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <BoxesIcon className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 font-medium text-foreground">No equipment found.</p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
            <table className="w-full table-fixed text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="w-[30%] px-5 py-3 font-medium">Equipment</th>
                  <th className="w-[20%] px-5 py-3 font-medium">Owner</th>
                  <th className="w-[12%] px-5 py-3 text-right font-medium">Price/Day</th>
                  <th className="w-[13%] px-5 py-3 font-medium">Status</th>
                  <th className="w-[25%] px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((item, index) => (
                  <tr
                    key={item.id ?? `equipment-${index}`}
                    className="border-t border-border transition hover:bg-muted/50"
                  >
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-11 w-16 shrink-0 rounded-md object-cover"
                        />
                        <div className="min-w-0">
                          <Link
                            href={`/equipment/${item.id}`}
                            className="block truncate font-medium text-foreground hover:text-primary"
                            title={item.name}
                          >
                            {item.name}
                          </Link>
                          <p className="truncate text-xs text-muted-foreground" title={item.category}>
                            {item.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle text-foreground/80">
                      <p className="truncate" title={item.owner?.name || item.owner?.email || ""}>
                        {item.owner?.name || item.owner?.email || "-"}
                      </p>
                      {item.owner?.name && item.owner?.email ? (
                        <p className="truncate text-xs text-muted-foreground" title={item.owner.email}>
                          {item.owner.email}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-right align-middle font-semibold text-foreground">
                      {formatCurrency(item.rentalPrice)}
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex flex-wrap justify-end gap-1">
                        {item.status !== "approved" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Approve ${item.name}`}
                            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                            onClick={() => handleStatus(item, "approved")}
                          >
                            <CheckIcon className="size-4" />
                          </Button>
                        )}
                        {item.status !== "rejected" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Reject ${item.name}`}
                            className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                            onClick={() => handleStatus(item, "rejected")}
                          >
                            <XIcon className="size-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`View ${item.name}`}
                          nativeButton={false}
                          render={<Link href={`/equipment/${item.id}`} />}
                        >
                          <EyeIcon className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Update ${item.name}`}
                          onClick={() => setEditing(item)}
                        >
                          <PencilIcon className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${item.name}`}
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {equipment.map((item, index) => (
              <div
                key={item.id ?? `equipment-mobile-${index}`}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-12 w-16 shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0">
                      <Link
                        href={`/equipment/${item.id}`}
                        className="block truncate font-medium text-foreground hover:text-primary"
                      >
                        {item.name}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Owner</span>
                    <span className="truncate text-right text-foreground/80">
                      {item.owner?.name || item.owner?.email || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Price/Day</span>
                    <span className="font-semibold text-foreground">{formatCurrency(item.rentalPrice)}</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap justify-end gap-1 border-t border-border pt-3">
                  {item.status !== "approved" && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Approve ${item.name}`}
                      className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                      onClick={() => handleStatus(item, "approved")}
                    >
                      <CheckIcon className="size-4" />
                    </Button>
                  )}
                  {item.status !== "rejected" && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Reject ${item.name}`}
                      className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                      onClick={() => handleStatus(item, "rejected")}
                    >
                      <XIcon className="size-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`View ${item.name}`}
                    nativeButton={false}
                    render={<Link href={`/equipment/${item.id}`} />}
                  >
                    <EyeIcon className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Update ${item.name}`}
                    onClick={() => setEditing(item)}
                  >
                    <PencilIcon className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${item.name}`}
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Equipment</DialogTitle>
            <DialogDescription>
              Changes are saved immediately when you press Update.
            </DialogDescription>
          </DialogHeader>
          <EquipmentForm
            key={editing?.id ?? "edit"}
            initial={editing ?? undefined}
            isSubmitting={saving}
            submitLabel="Update"
            onSubmit={handleUpdate}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
