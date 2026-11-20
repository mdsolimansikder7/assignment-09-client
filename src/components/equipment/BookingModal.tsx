"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon, TagIcon } from "lucide-react";
import toast from "react-hot-toast";

import { api, getErrorMessage } from "@/lib/api";
import {
  countDays,
  estimateTotal,
  formatCurrency,
  rentalUnit,
  todayInputValue,
} from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Equipment } from "@/types";

interface BookingModalProps {
  equipment: Equipment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingModal({ equipment, open, onOpenChange }: BookingModalProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setStartDate("");
    setEndDate("");
    setQuantity(1);
    setPhone("");
    setDeliveryAddress("");
    setNotes("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const days = startDate && endDate ? countDays(startDate, endDate) : 0;
  const unit = rentalUnit(equipment.rentalType);
  const total = estimateTotal(equipment.rentalType, equipment.rentalPrice, days, quantity);

  const maxQuantity = Math.max(1, equipment.availableQuantity);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!startDate) return toast.error("Please choose a start date.");
    if (!endDate) return toast.error("Please choose an end date.");
    if (new Date(endDate) < new Date(startDate))
      return toast.error("End date cannot be before the start date.");
    if (!deliveryAddress.trim()) return toast.error("Delivery address is required.");

    setSubmitting(true);
    try {
      const res = await api.post<{ data?: { id?: string }; url?: string }>("/bookings/checkout", {
        equipmentId: equipment.id,
        startDate,
        endDate,
        quantity,
        deliveryAddress: deliveryAddress.trim(),
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      const checkoutUrl = res.data?.url;
      if (checkoutUrl) {
        onOpenChange(false);
        window.location.href = checkoutUrl;
        return;
      }
      toast.success("Booking created!");
      onOpenChange(false);
      router.push("/dashboard/customer/my-rentals");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book &ldquo;{equipment.name}&rdquo;</DialogTitle>
          <DialogDescription>
            {formatCurrency(equipment.rentalPrice)} / {unit} · {equipment.location}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date *</Label>
              <Input
                id="start-date"
                type="date"
                min={todayInputValue()}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date *</Label>
              <Input
                id="end-date"
                type="date"
                min={startDate || todayInputValue()}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={maxQuantity}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Math.min(maxQuantity, Number(e.target.value) || 1)))
              }
              required
            />
            <p className="text-xs text-muted-foreground">
              {equipment.availableQuantity} available
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Contact Number (optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+880 1XXX XXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Delivery Address *</Label>
            <Input
              id="address"
              placeholder="Where should the equipment go?"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <textarea
              id="notes"
              rows={2}
              placeholder="Anything the owner should know?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50"
            />
          </div>

          <div className="rounded-xl border border-border bg-secondary p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="size-4 text-primary" />
                {days > 0 ? `${days} day${days > 1 ? "s" : ""}` : "Select dates"}
              </span>
              <span className="flex items-center gap-1.5">
                <TagIcon className="size-4 text-primary" />
                {quantity} × {formatCurrency(equipment.rentalPrice)} / {unit}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <span className="font-heading font-semibold">Total</span>
              <span className="font-heading text-xl font-bold text-primary">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting || days === 0}
            className="w-full bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            Confirm &amp; Pay · {formatCurrency(total)}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
