import type { Metadata } from "next";

import { OwnerRentalsTable } from "@/components/dashboard/OwnerRentalsTable";
import { PageHeader } from "@/components/dashboard/PageHeader";

export const metadata: Metadata = {
  title: "My Rentals",
};

export default function OwnerRentalsPage() {
  return (
    <>
      <PageHeader
        title="My Rentals"
        description="Bookings made against your equipment."
      />
      <OwnerRentalsTable />
    </>
  );
}
