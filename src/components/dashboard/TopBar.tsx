"use client";

import React, { useState } from "react";
import { SearchIcon } from "lucide-react";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopBar() {
  const { user, isLoading, isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);

  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Customer";

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  if (isLoading || !isLoggedIn || !user) {
    return null;
  }

  return (
    <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#0b1220] px-4 py-3 text-gray-100 md:px-6">
      <div className="flex min-w-0 flex-1 items-center">
        <div className="relative w-full max-w-xs sm:max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-white/10 bg-[#111827] pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus-visible:border-orange-500/50 focus-visible:ring-2 focus-visible:ring-orange-500/50"
          />
        </div>
      </div>

      <div className="hidden flex-1 justify-center sm:flex">
        <h1 className="text-sm font-semibold text-white md:text-base">
          {roleLabel} Dashboard
        </h1>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <NotificationBell />
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger className="rounded-full outline-none ring-offset-[#0b1220] transition focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2">
            <Avatar size="sm" className="cursor-pointer">
              <AvatarImage src={user.photo || undefined} alt={user.name} />
              <AvatarFallback className="bg-orange-500/15 font-semibold text-orange-400">
                {user.name?.charAt(0)?.toUpperCase() || "G"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <span className="flex items-center gap-2">Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}