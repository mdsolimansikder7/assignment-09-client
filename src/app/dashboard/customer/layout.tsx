import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { RoleGuard } from "@/components/dashboard/RoleGuard";

// Customer section: shell + role guard apply to every customer page.
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell role="customer">
      <RoleGuard role="customer">{children}</RoleGuard>
    </DashboardShell>
  );
}
