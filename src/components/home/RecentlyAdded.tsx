"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { EquipmentCard } from "@/components/equipment/EquipmentCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Equipment } from "@/types";


export function RecentlyAdded() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await api.get<{ data: Equipment[] }>("/equipment/featured");
        if (!cancelled) setItems(Array.isArray(res.data?.data) ? res.data.data.slice(0, 3) : []);
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="py-16 sm:py-20">
      <div className="container-page">
        <div className="mb-10">
          <h2 className="section-title">Recently Added Equipment</h2>
          <p className="section-subtitle">Freshly listed gear from our owners.</p>
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
            <p className="font-medium">Nothing new added yet.</p>
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
