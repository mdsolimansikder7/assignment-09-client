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
        description="Search users, change roles, or remove users when needed."
      />
      <UsersTable />
    </>
  );
}
