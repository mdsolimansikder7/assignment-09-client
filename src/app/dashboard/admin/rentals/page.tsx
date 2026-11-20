import type { Metadata } from "next";

import { AdminRentalsTable } from "@/components/dashboard/AdminRentalsTable";

export const metadata: Metadata = {
  title: "All Rentals",
};

export default function AdminRentalsPage() {
  return (
    <AdminRentalsTable
      title="All Rentals"
      description="Every booking made on GearLoop."
    />
  );
}
