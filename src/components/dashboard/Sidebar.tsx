"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3Icon,
  BoxesIcon,
  CalendarClockIcon,
  ExternalLinkIcon,
  HeartIcon,
  LogOutIcon,
  MenuIcon,
  PlusIcon,
  UserIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import toast from "react-hot-toast";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import type { AppUser, UserRole } from "@/types";

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
    { href: "/dashboard/customer/profile", label: "Profile", Icon: UserIcon },
  ],
  owner: [
    { href: "/dashboard/owner", label: "Overview", Icon: BarChart3Icon },
    { href: "/dashboard/owner/add-equipment", label: "Add Equipment", Icon: PlusIcon },
    { href: "/dashboard/owner/my-equipment", label: "My Equipment", Icon: BoxesIcon },
    { href: "/dashboard/owner/my-rentals", label: "My Rentals", Icon: CalendarClockIcon },
    { href: "/dashboard/owner/profile", label: "Profile", Icon: UserIcon },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", Icon: BarChart3Icon },
    { href: "/dashboard/admin/users", label: "All Users", Icon: UsersIcon },
    { href: "/dashboard/admin/equipment", label: "All Equipment", Icon: BoxesIcon },
    { href: "/dashboard/admin/rentals", label: "All Rentals", Icon: CalendarClockIcon },
    { href: "/dashboard/admin/profile", label: "Profile", Icon: UserIcon },
  ],
};

interface SidebarContentProps {
  role: UserRole;
  user: AppUser;
  onNavigate?: () => void;
}

export function SidebarContent({ role, user, onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const links = DASHBOARD_NAV[role] ?? DASHBOARD_NAV.customer;

  const isActive = (href: string) =>
    href === "/dashboard" ? false : pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <div className="flex h-full flex-col gap-2 bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-4 py-5">
        <Link href="/" className="flex items-center gap-2" onClick={onNavigate}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/gearloop-icon.svg"
            alt="GearLoop"
            width={36}
            height={36}
            className="h-9 w-9"
          />
          <span className="font-heading text-lg font-bold tracking-tight text-foreground">
            Gear<span className="text-primary">Loop</span>
          </span>
        </Link>
      </div>

      <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {role} dashboard
      </p>

      <nav className="flex flex-1 flex-col gap-1 px-2">
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
                  : "border-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-sidebar-border p-3">
        <div className="mb-3 flex items-center gap-2.5 px-2">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={user.photo || undefined}
              alt={user.name}
              className="rounded-full object-cover"
            />
            <AvatarFallback className="flex items-center justify-center rounded-full bg-orange-500/15 font-semibold text-orange-600 dark:text-orange-400">
              {user.name?.charAt(0)?.toUpperCase() || "G"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
            <p className="truncate text-xs capitalize text-muted-foreground">{user.role}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            {(user as { isDemo?: boolean }).isDemo && (
              <span className="mt-1 inline-block rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                READ-ONLY
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Link
            href="/"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-lg border-l-2 border-transparent px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <ExternalLinkIcon className="size-4 shrink-0" />
            Back to Website
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-lg border-l-2 border-transparent px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-500/10 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <LogOutIcon className="size-4 shrink-0" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export function DashboardSidebar({ role, user }: { role: UserRole; user: AppUser }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <SidebarContent role={role} user={user} />
      </aside>

      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background px-4 text-foreground lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open dashboard menu"
                className="text-foreground hover:bg-muted/50"
              />
            }
          >
            <MenuIcon className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground">
            <SheetHeader className="sr-only">
              <SheetTitle>Dashboard menu</SheetTitle>
            </SheetHeader>
            <SidebarContent
              role={role}
              user={user}
              onNavigate={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/gearloop-icon.svg"
            alt="GearLoop"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="font-heading text-base font-bold text-foreground">
            Gear<span className="text-primary">Loop</span>
          </span>
        </Link>

        <Avatar size="sm" className="ml-auto h-8 w-8">
          <AvatarImage
            src={user.photo || undefined}
            alt={user.name}
            className="rounded-full object-cover"
          />
          <AvatarFallback className="flex items-center justify-center rounded-full bg-orange-500/15 font-semibold text-orange-600 dark:text-orange-400">
            {user.name?.charAt(0)?.toUpperCase() || "G"}
          </AvatarFallback>
        </Avatar>
      </div>
    </>
  );
}
