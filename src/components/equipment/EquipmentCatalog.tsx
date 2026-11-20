"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PackageSearchIcon } from "lucide-react";

import { api, getErrorMessage } from "@/lib/api";
import { EquipmentCard } from "@/components/equipment/EquipmentCard";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiListResponse, Equipment } from "@/types";

const PAGE_SIZE = 12;

const FILTER_KEYS = [
  "search",
  "category",
  "rentalType",
  "minPrice",
  "maxPrice",
  "availability",
  "sort",
] as const;

export function EquipmentCatalogSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EquipmentCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<Equipment[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  useEffect(() => {
    let cancelled = false;

    const params: Record<string, string> = {
      page: String(page),
      limit: String(PAGE_SIZE),
    };
    for (const key of FILTER_KEYS) {
      const value = searchParams.get(key);
      if (value) params[key] = value;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<ApiListResponse<Equipment>>("/equipment", { params });
        if (cancelled) return;
        setItems(res.data?.data ?? []);
        setTotal(res.data?.total ?? 0);
        setTotalPages(res.data?.totalPages ?? 1);
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
  }, [searchParams, page]);

  const goToPage = (next: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next > 1) params.set("page", String(next));
    else params.delete("page");
    router.replace(`/equipment?${params.toString()}`, { scroll: true });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading equipment…" : `${total} equipment found`}
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center">
          <p className="font-medium">Equipment could not be loaded.</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.refresh()}>
            Try Again
          </Button>
        </div>
      ) : loading ? (
        <EquipmentCatalogSkeleton />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-14 text-center">
          <PackageSearchIcon className="mx-auto size-10 text-muted-foreground/60" />
          <p className="mt-3 font-medium">No equipment matches your search.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try different keywords or clear some filters.
          </p>
          <Button
            variant="outline"
            className="mt-5"
            onClick={() => router.replace("/equipment")}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((equipment, index) => (
              <EquipmentCard
                key={equipment.id ?? `equipment-${index}`}
                equipment={equipment}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
        </>
      )}
    </div>
  );
}
