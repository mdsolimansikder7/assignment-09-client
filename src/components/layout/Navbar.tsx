"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDownIcon,
  LogOutIcon,
  MenuIcon,
  UserIcon,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/equipment", label: "All Equipment" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // The home link should only be active on "/".
  // Dashboard is active when the path starts with /dashboard.
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/dashboard")) return pathname.startsWith("/dashboard");
    return pathname.startsWith(href);
  };

  // Role-based dashboard link:
  // customer -> /dashboard/customer/my-rentals
  // owner -> /dashboard/owner/my-equipment
  // admin -> /dashboard/admin
  const dashboardHref =
    user?.role === "customer"
      ? "/dashboard/customer/my-rentals"
      : user?.role === "owner"
        ? "/dashboard/owner/my-equipment"
        : user?.role === "admin"
          ? "/dashboard/admin"
          : "/dashboard";

  const profileHref = user?.role
    ? `/dashboard/${user.role}/profile`
    : "/profile";

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        {/* Logo + brand name (same on every page) */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/gearloop-icon.svg"
            alt="GearLoop"
            height={40}
            width={40}
            className="h-10 w-10"
          />
          <span className="font-heading text-xl font-bold tracking-tight text-foreground">
            Gear<span className="text-primary">Loop</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {!isLoading && user && (
            <Link
              href={dashboardHref}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive(dashboardHref)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right side: theme + auth */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle />

          {isLoading ? (
            // Keep the space stable while the session loads.
            <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" className="h-9 gap-2 rounded-full pr-2 pl-1" />
                }
              >
                <Avatar size="sm">
                  <AvatarImage src={user.photo ?? undefined} alt={user.name} />
                  <AvatarFallback>
                    {user.name?.charAt(0)?.toUpperCase() || "G"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-24 truncate text-sm font-medium sm:block">
                  {user.name}
                </span>
                <ChevronDownIcon className="size-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-2 py-1.5">
                    <span className="block truncate text-sm font-medium">
                      {user.name}
                    </span>
                    <span className="block truncate text-xs font-normal text-muted-foreground">
                      {user.email}
                    </span>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  nativeButton={false}
                  render={<Link href={profileHref} />}
                >
                  <UserIcon className="size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={handleLogout}
                >
                  <LogOutIcon className="size-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button
                variant="ghost"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Login
              </Button>
              <Button
                className="bg-primary hover:bg-primary-hover"
                nativeButton={false}
                render={<Link href="/register" />}
              >
                Register
              </Button>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <MenuIcon className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo/gearloop-icon.svg"
                    alt="GearLoop"
                    width={32}
                    height={32}
                    className="h-8 w-8"
                  />
                  Gear<span className="text-primary">Loop</span>
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {!isLoading && user && (
                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive(dashboardHref)
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    Dashboard
                  </Link>
                )}
              </nav>

              <div className="mt-auto flex flex-col gap-2 border-t border-border p-4">
                {user ? (
                  <>
                    <div className="mb-1 flex items-center gap-2">
                      <Avatar size="sm">
                        <AvatarImage
                          src={user.photo ?? undefined}
                          alt={user.name}
                        />
                        <AvatarFallback>
                          {user.name?.charAt(0)?.toUpperCase() || "G"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      nativeButton={false}
                      render={
                        <Link
                          href={profileHref}
                          onClick={() => setMobileOpen(false)}
                        />
                      }
                    >
                      <UserIcon className="size-4" />
                      Profile
                    </Button>
                    <Button variant="destructive" onClick={handleLogout}>
                      <LogOutIcon className="size-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      nativeButton={false}
                      render={
                        <Link
                          href="/login"
                          onClick={() => setMobileOpen(false)}
                        />
                      }
                    >
                      Login
                    </Button>
                    <Button
                      className="bg-primary hover:bg-primary-hover"
                      nativeButton={false}
                      render={
                        <Link
                          href="/register"
                          onClick={() => setMobileOpen(false)}
                        />
                      }
                    >
                      Register
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
