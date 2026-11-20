"use client";

import Link from "next/link";
import { MapPinIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, rentalUnit } from "@/lib/format";
import type { Equipment, RentalType } from "@/types";

const RENTAL_LABELS: Record<RentalType, string> = {
  daily: "Daily Rental",
  weekly: "Weekly Rental",
  monthly: "Monthly Rental",
};

export function EquipmentCard({ equipment }: { equipment: Equipment }) {
  const { user } = useAuth();
  const detailsHref = user ? `/equipment/${equipment.id}` : `/login`;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md">
      <Link href={detailsHref} className="relative block aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={equipment.image}
          alt={equipment.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <span className="absolute top-3 left-3 rounded-md bg-background/90 px-2 py-1 text-xs font-medium text-foreground backdrop-blur">
          {equipment.category}
        </span>
        {equipment.availableQuantity <= 0 && (
          <span className="absolute top-3 right-3 rounded-md bg-destructive px-2 py-1 text-xs font-medium text-destructive-foreground">
            Unavailable
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="font-heading text-lg font-semibold leading-snug">
          <Link href={detailsHref} className="hover:text-primary">
            {equipment.name}
          </Link>
        </h3>

        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPinIcon className="size-3.5 shrink-0 text-primary" />
          {equipment.location}
        </p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div>
            <p className="text-xs text-muted-foreground">
              From {RENTAL_LABELS[equipment.rentalType]?.split(" ")[0] ?? "Daily"}
            </p>
            <p className="font-heading text-xl font-bold text-primary">
              {formatCurrency(equipment.rentalPrice)}
              <span className="text-xs font-medium text-muted-foreground"> / {rentalUnit(equipment.rentalType)}</span>
            </p>
          </div>
          <Button
            className="bg-primary hover:bg-primary-hover"
            nativeButton={false}
            render={<Link href={detailsHref} />}
          >
            {equipment.availableQuantity > 0 ? "View Details" : "Booked Out"}
          </Button>
        </div>
      </div>
    </article>
  );
}
