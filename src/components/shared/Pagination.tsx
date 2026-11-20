"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Builds a compact page list: 1 … 4 5 6 … 12
function getPages(current: number, total: number): (number | "…")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current]);
  if (current - 1 > 1) pages.add(current - 1);
  if (current + 1 < total) pages.add(current + 1);
  const sorted = [...pages].sort((a, b) => a - b);

  const result: (number | "…")[] = [];
  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) result.push("…");
    result.push(value);
  });
  return result;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-8 flex justify-center">
      <ul className="flex items-center gap-1">
        <li>
          <Button
            variant="outline"
            size="icon"
            aria-label="Go to previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
        </li>

        {getPages(page, totalPages).map((value, index) =>
          value === "…" ? (
            <li key={`ellipsis-${index}`} className="px-1 text-muted-foreground">
              …
            </li>
          ) : (
            <li key={`page-${value}`}>
              <Button
                variant={value === page ? "default" : "ghost"}
                size="icon"
                aria-current={value === page ? "page" : undefined}
                className={
                  value === page
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                    : "text-muted-foreground hover:text-foreground"
                }
                onClick={() => onPageChange(value)}
              >
                {value}
              </Button>
            </li>
          )
        )}

        <li>
          <Button
            variant="outline"
            size="icon"
            aria-label="Go to next page"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </li>
      </ul>
    </nav>
  );
}
