import type { Metadata } from "next";
import { Suspense } from "react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EquipmentCatalog, EquipmentCatalogSkeleton } from "@/components/equipment/EquipmentCatalog";
import { Filters } from "@/components/equipment/Filters";

export const metadata: Metadata = {
  title: "All Equipment",
};

export default function AllEquipmentPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="py-10 sm:py-14">
      <div className="container-page">
        <div className="mb-8 max-w-2xl">
          <h1 className="section-title">All Equipment</h1>
          <p className="section-subtitle">
            Browse our full catalogue — search by name or location, then narrow
            down by category, price and availability.
          </p>
        </div>

        <div className="space-y-6">
          <Suspense fallback={<div className="h-40 rounded-xl bg-muted" />}>
            <Filters />
          </Suspense>
          <Suspense fallback={<EquipmentCatalogSkeleton />}>
            <EquipmentCatalog />
          </Suspense>
        </div>
      </div>
      </section>
      </main>
      <Footer />
    </div>
  );
}
