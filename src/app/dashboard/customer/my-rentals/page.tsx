import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { RentalsTable } from "@/components/dashboard/RentalsTable";

export const metadata: Metadata = {
  title: "My Rentals",
};

export default function MyRentalsPage() {
  return (
    <>
      <PageHeader
        title="My Rentals"
        description="All equipment you have booked, with status and payment details."
      />
      <RentalsTable />
    </>
  );
}
