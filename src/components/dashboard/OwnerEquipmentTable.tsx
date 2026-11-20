"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BoxesIcon, EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Equipment } from "@/types";

export function OwnerEquipmentTable() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [saving, setSaving] = useState(false);

  async function fetchEquipment() {
    const res = await api.get<{ data: Equipment[] }>("/equipment/owner/mine");
    setEquipment(Array.isArray(res.data?.data) ? res.data.data : []);
  }

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      try {
        const res = await api.get<{ data: Equipment[] }>("/equipment/owner/mine");
        if (!cancelled) setEquipment(Array.isArray(res.data?.data) ? res.data.data : []);
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
  }, []);

  const handleUpdate = async (values: EquipmentFormValues) => {
    if (!editing) return;
    setSaving(true);
    try {
      await api.put(`/equipment/${editing.id}`, values);
      toast.success("Equipment updated!");
      setEditing(null);
      await fetchEquipment();
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
      <div className="space-y-2 rounded-xl border border-border bg-card">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-12 w-16 rounded-md" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="hidden h-4 w-24 sm:block" />
            <Skeleton className="h-7 w-40" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center">
        <p className="font-medium">Your equipment could not be loaded.</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (equipment.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
        <BoxesIcon className="mx-auto size-10 text-muted-foreground/60" />
        <p className="mt-3 font-medium">You have not listed any equipment yet.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first item and start earning.
        </p>
        <Button
          className="mt-5 bg-primary text-primary-foreground hover:bg-primary-hover"
          nativeButton={false}
          render={<Link href="/dashboard/owner/add-equipment" />}
        >
          Add Equipment
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price / day</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.map((item, index) => (
                <TableRow key={item.id ?? `equipment-${index}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-11 w-16 shrink-0 rounded-md object-cover"
                      />
                      <Link
                        href={`/equipment/${item.id}`}
                        className="line-clamp-2 max-w-44 font-medium hover:text-primary"
                      >
                        {item.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.category}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(item.rentalPrice)}
                  </TableCell>
                  <TableCell>{item.availableQuantity}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

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
