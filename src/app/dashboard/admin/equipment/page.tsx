import type { Metadata } from "next";

import { AdminEquipmentTable } from "@/components/dashboard/AdminEquipmentTable";
import { PageHeader } from "@/components/dashboard/PageHeader";

export const metadata: Metadata = {
  title: "All Equipment",
};

export default function AdminEquipmentPage() {
  return (
    <>
      <PageHeader
        title="All Equipment"
        description="Approve or reject new listings, update details, or remove equipment."
      />
      <AdminEquipmentTable />
    </>
  );
}
