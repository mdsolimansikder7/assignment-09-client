"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HeartIcon, Trash2Icon } from "lucide-react";
import toast from "react-hot-toast";

import { api, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FavoriteItem } from "@/types";

export function FavoritesTable() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await api.get<{ data: FavoriteItem[] }>("/favorites");
        if (!cancelled) setFavorites(Array.isArray(res.data?.data) ? res.data.data : []);
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

  const handleRemove = async (equipmentId: string) => {
    setRemovingId(equipmentId);
    try {
      await api.delete(`/favorites/${equipmentId}`);
      setFavorites((prev) =>
        prev.filter((item) => item.equipmentId !== equipmentId)
      );
      toast.success("Removed from favorites");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2 rounded-xl border border-border bg-card">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-12 w-16 rounded-md" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="hidden h-4 w-24 sm:block" />
            <Skeleton className="h-7 w-28" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center">
        <p className="font-medium">Favorites could not be loaded.</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
        <HeartIcon className="mx-auto size-10 text-muted-foreground/60" />
        <p className="mt-3 font-medium">No favorites yet.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Open any equipment page and add it to your favorites.
        </p>
        <Button
          className="mt-5 bg-primary text-primary-foreground hover:bg-primary-hover"
          nativeButton={false}
          render={<Link href="/equipment" />}
        >
          Browse Equipment
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipment</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {favorites.map((item, index) => (
              <TableRow key={item.id ?? `favorite-${item.equipmentId ?? index}`}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.equipment?.image}
                      alt={item.equipment?.name}
                      className="h-11 w-16 shrink-0 rounded-md object-cover"
                    />
                    <Link
                      href={`/equipment/${item.equipmentId}`}
                      className="line-clamp-2 max-w-48 font-medium hover:text-primary"
                    >
                      {item.equipment?.name}
                    </Link>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.equipment?.category}
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(item.equipment?.rentalPrice ?? 0)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      nativeButton={false}
                      render={<Link href={`/equipment/${item.equipmentId}`} />}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={removingId === item.id}
                      onClick={() => handleRemove(item.equipmentId)}
                    >
                      <Trash2Icon className="size-4" />
                      Remove
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
