"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Camera,
  Cpu,
  HardHat,
  PartyPopper,
  Tractor,
  Truck,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORIES } from "@/types";

const ICONS: Record<string, LucideIcon> = {
  construction: HardHat,
  camera: Camera,
  vehicles: Truck,
  agriculture: Tractor,
  electronics: Cpu,
  event: PartyPopper,
};

export function Categories() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <h2 className="section-title">Browse by Category</h2>
            <p className="section-subtitle">
              From construction sites to photo shoots — find the exact gear you need.
            </p>
          </div>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/equipment" />}
          >
            View All Equipment
          </Button>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category, index) => {
            const Icon = ICONS[category.slug] ?? HardHat;
            return (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 * index }}
              >
                <Link href={`/equipment?category=${encodeURIComponent(category.name)}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardContent className="flex h-full flex-col gap-4 p-6">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                        <Icon className="size-6" />
                      </div>
                      <div>
                        <h3 className="font-heading text-lg font-semibold">{category.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
