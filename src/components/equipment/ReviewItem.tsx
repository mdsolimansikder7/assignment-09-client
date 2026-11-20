"use client";

import { useState } from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";
import toast from "react-hot-toast";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";
import { deleteReview, getErrorMessage, updateReview } from "@/lib/api";
import type { EquipmentReview } from "@/types";
import { StarRating } from "./StarRating";
import { Textarea } from "@/components/ui/textarea";

interface ReviewItemProps {
  review: EquipmentReview;
  currentUserEmail?: string;
  isAdmin?: boolean;
  onChanged: () => void;
}

export function ReviewItem({ review, currentUserEmail, isAdmin, onChanged }: ReviewItemProps) {
  const [editing, setEditing] = useState(false);
  const [editRating, setEditRating] = useState(review.rating);
  const [editComment, setEditComment] = useState(review.comment);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAuthor = !!currentUserEmail && currentUserEmail === review.userEmail;
  const canEdit = isAuthor;
  const canDelete = isAuthor || !!isAdmin;

  const handleSave = async () => {
    const comment = editComment.trim();
    if (editRating < 1 || editRating > 5) {
      toast.error("Please select a rating from 1 to 5.");
      return;
    }
    if (comment.length < 3) {
      toast.error("Comment must be at least 3 characters.");
      return;
    }
    if (comment.length > 500) {
      toast.error("Comment must be 500 characters or less.");
      return;
    }

    setSaving(true);
    try {
      await updateReview(review.id, { rating: editRating, comment });
      toast.success("Review updated");
      setEditing(false);
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteReview(review.id);
      toast.success("Review deleted");
      setDeleteOpen(false);
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Avatar className="size-10">
          <AvatarImage src={review.userAvatar || undefined} alt={review.userName || "User"} />
          <AvatarFallback>{(review.userName || "U").charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium text-foreground">{review.userName || "Customer"}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(review.createdAt || undefined)}
              </p>
            </div>
            {!editing && (
              <div className="flex items-center gap-2">
                <StarRating value={review.rating} readOnly size="sm" />
                {(canEdit || canDelete) && (
                  <div className="flex items-center gap-1">
                    {canEdit && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Edit review"
                        onClick={() => {
                          setEditRating(review.rating);
                          setEditComment(review.comment);
                          setEditing(true);
                        }}
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Delete review"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteOpen(true)}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {editing ? (
            <div className="mt-3 space-y-3">
              <div>
                <p className="mb-1 text-sm font-medium text-foreground">Rating</p>
                <StarRating value={editRating} onChange={setEditRating} />
              </div>
              <div className="space-y-1">
                <Textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value.slice(0, 500))}
                  rows={4}
                  placeholder="Update your review..."
                />
                <p className="text-right text-xs text-muted-foreground">{editComment.length}/500</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary-hover"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {review.comment}
            </p>
          )}
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete review?</DialogTitle>
            <DialogDescription>
              This will permanently remove your review. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
