"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { canReview, getErrorMessage, getReviews } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CanReviewResponse, EquipmentReview, EquipmentReviewsResponse } from "@/types";
import { ReviewForm } from "./ReviewForm";
import { ReviewItem } from "./ReviewItem";
import { StarRating } from "./StarRating";

interface ReviewsSectionProps {
  equipmentId: string;
}

function RatingBreakdown({ reviews }: { reviews: EquipmentReview[] }) {
  const total = reviews.length || 1;
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="w-full max-w-xs space-y-1.5">
      {counts.map(({ star, count }) => {
        const pct = Math.round((count / total) * 100);
        return (
          <div key={star} className="flex items-center gap-2 text-xs">
            <span className="w-8 text-muted-foreground">{star} ★</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-orange-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-8 text-right text-muted-foreground">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ReviewsSection({ equipmentId }: ReviewsSectionProps) {
  const { user, isLoggedIn } = useAuth();

  const [reviews, setReviews] = useState<EquipmentReview[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [canReviewState, setCanReviewState] = useState<CanReviewResponse | null>(null);
  const [canReviewLoading, setCanReviewLoading] = useState(false);

  const loadReviews = useCallback(
    async (pageToLoad: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      try {
        const data = (await getReviews(equipmentId, pageToLoad, 10)) as EquipmentReviewsResponse & {
          success?: boolean;
          message?: string;
        };
        const nextReviews = Array.isArray(data?.reviews) ? data.reviews : [];
        setReviews((prev) => (append ? [...prev, ...nextReviews] : nextReviews));
        setAverageRating(Number(data?.averageRating || 0));
        setTotalReviews(Number(data?.totalReviews || 0));
        setPage(Number(data?.page || pageToLoad));
        setTotalPages(Number(data?.totalPages || 1));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [equipmentId],
  );

  const loadCanReview = useCallback(async () => {
    if (!isLoggedIn) {
      setCanReviewState(null);
      return;
    }
    setCanReviewLoading(true);
    try {
      const data = (await canReview(equipmentId)) as CanReviewResponse & { success?: boolean };
      setCanReviewState({
        canReview: !!data?.canReview,
        reason: data?.reason || "",
        myReview: data?.myReview || null,
      });
    } catch {
      setCanReviewState(null);
    } finally {
      setCanReviewLoading(false);
    }
  }, [equipmentId, isLoggedIn]);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadReviews(1, false), loadCanReview()]);
  }, [loadReviews, loadCanReview]);

  useEffect(() => {
    loadReviews(1, false);
  }, [loadReviews]);

  useEffect(() => {
    loadCanReview();
  }, [loadCanReview]);

  const handleLoadMore = async () => {
    if (page >= totalPages || loadingMore) return;
    await loadReviews(page + 1, true);
  };

  return (
    <Card className="mt-10">
      <CardHeader>
        <CardTitle className="font-heading text-lg">Customer Reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-20 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <p className="font-medium text-foreground">Reviews could not be loaded.</p>
            <p className="mt-1 text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => loadReviews(1, false)}>
              Try again
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-end gap-3">
                  <span className="font-heading text-4xl font-bold text-foreground">
                    {averageRating.toFixed(1)}
                  </span>
                  <div className="pb-1">
                    <StarRating value={averageRating} readOnly />
                    <p className="mt-1 text-sm text-muted-foreground">
                      Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                </div>
              </div>
              {totalReviews > 0 && <RatingBreakdown reviews={reviews} />}
            </div>

            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
                  <p className="font-medium text-foreground">No reviews yet.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Be the first to review this equipment.
                  </p>
                </div>
              ) : (
                reviews.map((review) => (
                  <ReviewItem
                    key={review.id}
                    review={review}
                    currentUserEmail={user?.email}
                    isAdmin={user?.role === "admin"}
                    onChanged={refreshAll}
                  />
                ))
              )}
            </div>

            {page < totalPages && (
              <div className="flex justify-center">
                <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
                  {loadingMore ? "Loading..." : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}

        <div className="border-t border-border pt-6">
          <h3 className="mb-3 font-heading text-base font-semibold text-foreground">Write a review</h3>
          {!isLoggedIn ? (
            <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              <Link href="/login" className="font-medium text-primary hover:underline">
                Login
              </Link>{" "}
              to write a review.
            </div>
          ) : canReviewLoading ? (
            <Skeleton className="h-24 w-full rounded-xl" />
          ) : canReviewState?.canReview ? (
            <ReviewForm equipmentId={equipmentId} onSubmitted={refreshAll} />
          ) : canReviewState ? (
            <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              {canReviewState.reason || "You cannot review this equipment right now."}
              {canReviewState.myReview ? " You can edit or delete your review above." : ""}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Unable to check review eligibility right now.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
