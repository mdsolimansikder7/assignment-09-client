"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BoxesIcon, EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import type { Equipment } from "@/types";

export function OwnerEquipmentTable() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Equipment | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await api.get<{ data: Equipment[] }>("/equipment/owner/mine");
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
  }, []);

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

    try {
      await api.delete(`/equipment/${item.id}`);
      setEquipment((prev) => prev.filter((e) => e.id !== item.id));
      toast.success("Equipment deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
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

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-foreground">Could not load your equipment</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (equipment.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
        <BoxesIcon className="mx-auto size-8 text-muted-foreground/40" />
        <p className="mt-3 font-medium text-foreground">No equipment yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first listing to start receiving bookings.
        </p>
        <Link
          href="/dashboard/owner/add-equipment"
          className={cn(buttonVariants(), "mt-4 bg-primary text-primary-foreground hover:bg-primary-hover")}
        >
          Add Equipment
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col className="w-[30%]" />
            <col className="w-[16%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[10%]" />
            <col className="w-[16%]" />
          </colgroup>
          <thead className="bg-card">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Equipment Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rental Price</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Available Quantity</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {equipment.map((item) => (
              <tr key={item.id} className="transition hover:bg-muted/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="size-10 shrink-0 rounded-md object-cover"
                    />
                    <span className="truncate font-medium text-foreground" title={item.name}>
                      {item.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <span className="block truncate" title={item.category}>{item.category}</span>
                </td>
                <td className="px-4 py-3 text-foreground">
                  {formatCurrency(item.rentalPrice)}/{item.rentalType === "daily" ? "day" : item.rentalType === "weekly" ? "week" : "month"}
                </td>
                <td className="px-4 py-3 text-foreground">{item.availableQuantity}</td>
                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
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
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-foreground"
                      title="Update"
                      onClick={() => setEditing(item)}
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      title="Delete"
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
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Rental Price</dt>
                <dd className="text-foreground">{formatCurrency(item.rentalPrice)}/{item.rentalType === "daily" ? "day" : item.rentalType === "weekly" ? "week" : "month"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Available Quantity</dt>
                <dd className="text-foreground">{item.availableQuantity}</dd>
              </div>
            </dl>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/equipment/${item.id}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
              >
                <EyeIcon className="size-4" /> View Details
              </Link>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditing(item)}>
                <PencilIcon className="size-4" /> Update
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleDelete(item)}
              >
                <Trash2Icon className="size-4" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update equipment</DialogTitle>
            <DialogDescription>
              Changes are saved to your listing. Updating an approved item keeps its current approval status.
            </DialogDescription>
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
    </>
  );
}
