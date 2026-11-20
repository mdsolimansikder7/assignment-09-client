import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { RoleGuard } from "@/components/dashboard/RoleGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell role="admin">
      <RoleGuard role="admin">{children}</RoleGuard>
    </DashboardShell>
  );
}
