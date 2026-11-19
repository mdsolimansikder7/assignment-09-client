"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { api, getErrorMessage } from "@/lib/api";
import { EquipmentCard } from "@/components/equipment/EquipmentCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Equipment } from "@/types";

// Backend contract: GET /equipment/featured → { data: Equipment[] } (6 items)

export function FeaturedEquipment() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await api.get<{ data: Equipment[] }>("/equipment/featured");
        if (!cancelled) setItems(Array.isArray(res.data?.data) ? res.data.data : []);
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

  if (error) {
    return (
      <section className="py-16 sm:py-20">
        <div className="container-page">
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <p className="font-medium">Featured equipment is not available right now.</p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20">
      <div className="container-page">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="section-title">Featured Equipment</h2>
            <p className="section-subtitle">
              Hand-picked premium gear loved by our customers.
            </p>
          </div>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/equipment" />}
          >
            View All Equipment
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-1/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <p className="font-medium">No featured equipment yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Check back soon — new gear gets featured here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((equipment, index) => (
              <EquipmentCard
                key={equipment.id ?? `equipment-${index}`}
                equipment={equipment}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
