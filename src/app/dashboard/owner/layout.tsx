import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { RoleGuard } from "@/components/dashboard/RoleGuard";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell role="owner">
      <RoleGuard role="owner">{children}</RoleGuard>
    </DashboardShell>
  );
}
