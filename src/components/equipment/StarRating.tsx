"use client";

import { StarIcon } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md";
  showValue?: boolean;
}

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
  showValue = false,
}: StarRatingProps) {
  const iconSize = size === "sm" ? "size-4" : "size-5";
  const interactive = !readOnly && typeof onChange === "function";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, star: number) => {
    if (!interactive) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange?.(Math.min(5, star + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange?.(Math.max(1, star - 1));
    }
  };

  const stars = [1, 2, 3, 4, 5].map((star) => {
    if (interactive) {
      const filled = star <= value;
      return (
        <button
          key={star}
          type="button"
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onClick={() => onChange?.(star)}
          onKeyDown={(e) => handleKeyDown(e, star)}
          className="rounded-sm p-0.5 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <StarIcon
            className={`${iconSize} ${filled ? "fill-orange-500 text-orange-500" : "text-muted-foreground/40"}`}
          />
        </button>
      );
    }

    const fillPercent = Math.max(0, Math.min(1, value - (star - 1))) * 100;
    return (
      <span key={star} className="relative inline-flex">
        <StarIcon className={`${iconSize} text-muted-foreground/30`} />
        {fillPercent > 0 && (
          <span
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${fillPercent}%` }}
            aria-hidden="true"
          >
            <StarIcon className={`${iconSize} fill-orange-500 text-orange-500`} />
          </span>
        )}
      </span>
    );
  });

  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`Rating ${value} out of 5`}>
      {stars}
      {showValue && <span className="ml-1 text-sm text-muted-foreground">{value.toFixed(1)}</span>}
    </div>
  );
}
