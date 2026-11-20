"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createReview, getErrorMessage } from "@/lib/api";
import { StarRating } from "./StarRating";

interface ReviewFormProps {
  equipmentId: string;
  onSubmitted: () => void;
}

export function ReviewForm({ equipmentId, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = comment.trim();

    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating from 1 to 5 stars.");
      return;
    }
    if (trimmed.length < 3) {
      toast.error("Comment must be at least 3 characters.");
      return;
    }
    if (trimmed.length > 500) {
      toast.error("Comment must be 500 characters or less.");
      return;
    }

    setSubmitting(true);
    try {
      await createReview(equipmentId, { rating, comment: trimmed });
      toast.success("Review submitted!");
      setRating(0);
      setComment("");
      onSubmitted();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Your rating *</p>
        <StarRating value={rating} onChange={setRating} />
        <p className="mt-1 text-xs text-muted-foreground">Click a star to rate (1-5)</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="review-comment" className="text-sm font-medium text-foreground">
          Your review *
        </label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 500))}
          placeholder="Share your experience with this equipment..."
          rows={4}
          maxLength={500}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Minimum 3 characters</span>
          <span>{comment.length}/500</span>
        </div>
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="bg-primary text-primary-foreground hover:bg-primary-hover"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
