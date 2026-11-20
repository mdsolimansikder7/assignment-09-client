import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { OwnerEquipmentTable } from "@/components/dashboard/OwnerEquipmentTable";

export const metadata: Metadata = {
  title: "My Equipment",
};

export default function OwnerEquipmentPage() {
  return (
    <>
      <PageHeader
        title="My Equipment"
        description="Update prices and details, or remove listings you no longer rent out."
      />
      <OwnerEquipmentTable />
    </>
  );
}
