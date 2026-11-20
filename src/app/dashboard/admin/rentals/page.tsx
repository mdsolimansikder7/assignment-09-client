import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { AdminRentalsTable } from "@/components/dashboard/AdminRentalsTable";

export const metadata: Metadata = {
  title: "All Rentals",
};

export default function AdminRentalsPage() {
  return (
    <>
      <PageHeader
        title="All Rentals"
        description="Monitor and manage all bookings on GearLoop."
      />
      <AdminRentalsTable />
    </>
  );
}
