import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { UsersTable } from "@/components/dashboard/UsersTable";

export const metadata: Metadata = {
  title: "All Users",
};

export default function AdminUsersPage() {
  return (
    <>
      <PageHeader
        title="All Users"
        description="Search users and change their roles (customer, owner or admin)."
      />
      <UsersTable />
    </>
  );
}
