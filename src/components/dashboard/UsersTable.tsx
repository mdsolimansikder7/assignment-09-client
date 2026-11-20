"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2Icon, UserSearchIcon } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

import { api, getErrorMessage } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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

function RoleSelect({
  userId,
  current,
  onChange,
  disabled,
}: {
  userId: string;
  current: UserRole;
  onChange: (id: string, role: UserRole) => void;
  disabled: boolean;
}) {
  return (
    <Select
      value={current}
      onValueChange={(v) => onChange(userId, v as UserRole)}
      disabled={disabled}
    >
      <SelectTrigger
        size="sm"
        className="w-full min-w-0 rounded-md border-border bg-card text-foreground capitalize disabled:cursor-not-allowed disabled:opacity-50"
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
  );
}

export function UsersTable() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term),
    );
  }, [users, search]);

  const handleChangeRole = async (id: string, role: UserRole) => {
    setUpdatingId(id);
    try {
      const res = await api.patch<{ data: AppUser }>(`/users/${id}/role`, { role });
      const updated = res.data?.data;
      if (updated) {
        setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      }
      toast.success("Role updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (target: AppUser) => {
    const result = await Swal.fire({
      title: "Delete this user?",
      text: `${target.name} (${target.email}) will be removed. This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      confirmButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    setDeletingId(target.id);
    try {
      await api.delete(`/users/${target.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
      toast.success("User deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full max-w-xs rounded-lg" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-foreground">Could not load users</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-xs">
        <UserSearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No users found.</p>
      ) : (
        <>
          <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-[28%]" />
                <col className="w-[28%]" />
                <col className="w-[14%]" />
                <col className="w-[14%]" />
                <col className="w-[16%]" />
              </colgroup>
              <thead className="bg-card">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Registration Date</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((u) => {
                  const isMe = me?.email === u.email || me?.id === u.id;
                  const busy = updatingId === u.id || deletingId === u.id;
                  return (
                    <tr key={u.id} className="transition hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="size-8 shrink-0">
                            <AvatarImage src={u.photo || undefined} alt={u.name} />
                            <AvatarFallback className="bg-orange-500/15 text-xs font-semibold text-orange-600 dark:text-orange-400">
                              {u.name?.charAt(0)?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate font-medium text-foreground" title={u.name}>
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="block truncate text-muted-foreground" title={u.email}>
                          {u.email}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <RoleSelect
                          userId={u.id}
                          current={u.role}
                          onChange={handleChangeRole}
                          disabled={busy || isMe}
                        />
                        {isMe && (
                          <p className="mt-1 text-xs text-muted-foreground">You</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDelete(u)}
                            disabled={busy || isMe}
                            title={isMe ? "You cannot delete your own account" : "Delete user"}
                          >
                            <Trash2Icon className="size-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((u) => {
              const isMe = me?.email === u.email || me?.id === u.id;
              const busy = updatingId === u.id || deletingId === u.id;
              return (
                <div key={u.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage src={u.photo || undefined} alt={u.name} />
                      <AvatarFallback className="bg-orange-500/15 text-sm font-semibold text-orange-600 dark:text-orange-400">
                        {u.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground" title={u.name}>{u.name}</p>
                      <p className="truncate text-sm text-muted-foreground" title={u.email}>{u.email}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Registered: {formatDate(u.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2">
                    <div>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">Role</p>
                      <RoleSelect
                        userId={u.id}
                        current={u.role}
                        onChange={handleChangeRole}
                        disabled={busy || isMe}
                      />
                      {isMe && <p className="mt-1 text-xs text-muted-foreground">You cannot change your own role.</p>}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(u)}
                      disabled={busy || isMe}
                    >
                      <Trash2Icon className="size-4" />
                      {deletingId === u.id ? "Deleting..." : "Delete User"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
