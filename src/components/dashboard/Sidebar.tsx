"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3Icon,
  BoxesIcon,
  CalendarClockIcon,
  HeartIcon,
  LogOutIcon,
  MenuIcon,
  PlusIcon,
  UserIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";

interface NavLink {
  href: string;
  label: string;
  Icon: LucideIcon;
}

export const DASHBOARD_NAV: Record<UserRole, NavLink[]> = {
  customer: [
    { href: "/dashboard/customer", label: "Overview", Icon: BarChart3Icon },
    { href: "/dashboard/customer/my-rentals", label: "My Rentals", Icon: CalendarClockIcon },
    { href: "/dashboard/customer/favorites", label: "Favorites", Icon: HeartIcon },
    { href: "/dashboard/customer/profile", label: "My Profile", Icon: UserIcon },
  ],
  owner: [
    { href: "/dashboard/owner", label: "Overview", Icon: BarChart3Icon },
    { href: "/dashboard/owner/add-equipment", label: "Add Equipment", Icon: PlusIcon },
    { href: "/dashboard/owner/my-equipment", label: "My Equipment", Icon: BoxesIcon },
    { href: "/dashboard/owner/my-rentals", label: "My Rentals", Icon: CalendarClockIcon },
    { href: "/dashboard/owner/profile", label: "My Profile", Icon: UserIcon },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", Icon: BarChart3Icon },
    { href: "/dashboard/admin/users", label: "All Users", Icon: UsersIcon },
    { href: "/dashboard/admin/equipment", label: "All Equipment", Icon: BoxesIcon },
    { href: "/dashboard/admin/rentals", label: "All Rentals", Icon: CalendarClockIcon },
    { href: "/dashboard/admin/profile", label: "My Profile", Icon: UserIcon },
  ],
};

interface SidebarContentProps {
  role: UserRole;
  onNavigate?: () => void;
}

export function SidebarContent({ role, onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const links = DASHBOARD_NAV[role] ?? DASHBOARD_NAV.customer;

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    onNavigate?.();
    router.push("/");
  };

  return (
    <div className="flex h-full flex-col bg-card text-foreground">
      <div className="border-b border-border px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {role} dashboard
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {links.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-2">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg border-l-2 border-transparent px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOutIcon className="size-4 shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );
}

export function DashboardMobileMenuButton({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="mb-4 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="gap-2 border-border bg-card text-foreground"
              aria-label="Open dashboard menu"
            />
          }
        >
          <MenuIcon className="size-4" />
          Menu
        </SheetTrigger>
        <SheetContent side="left" className="w-72 border-border bg-card p-0 text-foreground">
          <SheetHeader className="sr-only">
            <SheetTitle>Dashboard menu</SheetTitle>
          </SheetHeader>
          <SidebarContent role={role} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function DashboardSidebar({ role }: { role: UserRole }) {
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[260px] shrink-0 self-start overflow-y-auto border-r border-border bg-card lg:block">
      <SidebarContent role={role} />
    </aside>
  );
}
