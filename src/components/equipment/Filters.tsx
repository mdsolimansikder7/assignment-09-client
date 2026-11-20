"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RotateCcwIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, RENTAL_TYPES } from "@/types";

const SORT_OPTIONS = [
  { value: "newest", label: "Recently Added" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.replace(`/equipment?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (searchParams.get("search") ?? "")) update("search", search);
      if (minPrice !== (searchParams.get("minPrice") ?? "")) update("minPrice", minPrice);
      if (maxPrice !== (searchParams.get("maxPrice") ?? "")) update("maxPrice", maxPrice);
    }, 450);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, minPrice, maxPrice]);

  const resetAll = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    router.replace("/equipment", { scroll: false });
  };

  const toFilterValue = (value: string | null) => (!value || value === "all" ? "" : value);

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="equipment-search">Search</Label>
          <div className="relative">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="equipment-search"
              placeholder="Name or location…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={searchParams.get("category") ?? "all"}
            onValueChange={(value) => update("category", toFilterValue(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.slug} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Rental Type</Label>
          <Select
            value={searchParams.get("rentalType") ?? "all"}
            onValueChange={(value) => update("rentalType", toFilterValue(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Any type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any type</SelectItem>
              {RENTAL_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Sort By</Label>
          <Select
            value={searchParams.get("sort") ?? "newest"}
            onValueChange={(value) => update("sort", value ?? "newest")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Recently Added" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Min Price ($)</Label>
          <Input
            type="number"
            min={0}
            placeholder="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Max Price ($)</Label>
          <Input
            type="number"
            min={0}
            placeholder="1000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Availability</Label>
          <Select
            value={searchParams.get("availability") ?? "all"}
            onValueChange={(value) => update("availability", toFilterValue(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              <SelectItem value="available">Available now</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button variant="outline" className="w-full" onClick={resetAll}>
            <RotateCcwIcon className="size-4" />
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
