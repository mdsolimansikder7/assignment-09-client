"use client";

import { useEffect, useState } from "react";
import { BellIcon, BellRingIcon, Loader2Icon } from "lucide-react";

import { api, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import type { Notification } from "@/types";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await api.get<{ data: Notification[]; total: number }>(
          "/notifications?limit=10"
        );
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        if (!cancelled) {
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.read).length);
        }
      } catch (err) {
        if (!cancelled) toast.error(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative" />}>
        {unreadCount > 0 ? (
          <BellRingIcon className="size-5" />
        ) : (
          <BellIcon className="size-5" />
        )}
        {unreadCount > 0 && (
          <Badge className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-destructive p-0 text-[10px] text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No notifications yet.
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex flex-col items-start gap-1"
                onClick={() => {
                  if (!n.read) handleMarkOneRead(n.id);
                  if (n.link) {
                    window.location.href = n.link;
                  }
                }}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-medium">{n.title}</span>
                  {!n.read && (
                    <span className="size-2 rounded-full bg-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{n.message}</p>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}