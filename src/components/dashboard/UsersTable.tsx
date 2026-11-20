"use client";

import { useEffect, useState } from "react";
import { UserSearchIcon } from "lucide-react";
import toast from "react-hot-toast";

import { api, getErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AppUser, UserRole } from "@/types";

const ROLES: UserRole[] = ["customer", "owner", "admin"];

export function UsersTable() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<{ data: AppUser[] }>("/users");
        if (!cancelled) setUsers(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = users.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const handleRoleChange = async (user: AppUser, role: UserRole) => {
    if (role === user.role) return;
    setUpdatingId(user.id);
    try {
      await api.put(`/users/${user.id}/role`, { role });
      setUsers((prev) =>
        prev.map((item) => (item.id === user.id ? { ...item, role } : item))
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="max-w-sm">
          <Input
            placeholder="Search by name or email…"
            disabled
            className="h-10 w-full max-w-sm rounded-lg border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-t border-border px-5 py-4 first:border-t-0">
              <Skeleton className="size-9 rounded-full bg-muted/50" />
              <Skeleton className="h-10 flex-1 bg-muted/50" />
              <Skeleton className="h-8 w-32 bg-muted/50" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-10 text-center">
        <p className="font-medium text-foreground">Users could not be loaded.</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  const roleSelectClass = (role: UserRole) => {
    if (role === "admin") return "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400";
    if (role === "owner") return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300";
    return "border-border bg-background text-foreground";
  };

  return (
    <div className="space-y-4">
      <div className="max-w-sm">
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full max-w-sm rounded-lg border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-orange-500/50 focus-visible:ring-2 focus-visible:ring-orange-500/50"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <UserSearchIcon className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 font-medium text-foreground">No users found.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a different search term.</p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
            <table className="w-full table-fixed text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="w-[50%] px-5 py-3 font-medium">User</th>
                  <th className="w-[25%] px-5 py-3 font-medium">Joined</th>
                  <th className="w-[25%] px-5 py-3 text-right font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, index) => (
                  <tr
                    key={user.id ?? `user-${index}`}
                    className="border-t border-border transition hover:bg-muted/50"
                  >
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" className="h-9 w-9">
                          <AvatarImage
                            src={user.photo || undefined}
                            alt={user.name}
                            className="rounded-full object-cover"
                          />
                          <AvatarFallback className="flex h-full w-full items-center justify-center rounded-full bg-orange-500/15 font-semibold text-orange-600 dark:text-orange-400">
                            {user.name?.charAt(0)?.toUpperCase() || "G"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground" title={user.name}>
                            {user.name}
                          </p>
                          <p className="truncate text-sm text-muted-foreground" title={user.email}>
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex justify-end">
                        <Select
                          value={user.role}
                          disabled={updatingId === user.id}
                          onValueChange={(value) =>
                            handleRoleChange(user, (value ?? "customer") as UserRole)
                          }
                        >
                          <SelectTrigger
                            className={`h-auto w-36 rounded-full border px-3 py-1.5 text-sm font-medium capitalize dark:[color-scheme:dark] ${roleSelectClass(
                              user.role
                            )}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((role) => (
                              <SelectItem key={role} value={role} className="capitalize">
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((user, index) => (
              <div
                key={user.id ?? `user-mobile-${index}`}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar size="sm" className="h-9 w-9">
                    <AvatarImage
                      src={user.photo || undefined}
                      alt={user.name}
                      className="rounded-full object-cover"
                    />
                    <AvatarFallback className="flex h-full w-full items-center justify-center rounded-full bg-orange-500/15 font-semibold text-orange-600 dark:text-orange-400">
                      {user.name?.charAt(0)?.toUpperCase() || "G"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{user.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Joined</span>
                    <span className="text-foreground/80">{formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Role</span>
                    <Select
                      value={user.role}
                      disabled={updatingId === user.id}
                      onValueChange={(value) =>
                        handleRoleChange(user, (value ?? "customer") as UserRole)
                      }
                    >
                      <SelectTrigger
                        className={`h-auto w-36 rounded-full border px-3 py-1.5 text-sm font-medium capitalize dark:[color-scheme:dark] ${roleSelectClass(
                          user.role
                        )}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((role) => (
                          <SelectItem key={role} value={role} className="capitalize">
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
