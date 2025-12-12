import { useState } from "react";
import { Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { openContractCall } from "@stacks/connect";
import { submitReview, hasReviewed } from "@/lib/reputation";
import { NETWORK } from "@/lib/config";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ReviewDialogProps {
    bookingId: number;
    reviewee: string; // The person being reviewed (host or guest)
    revieweeName?: string; // Display name
    propertyTitle?: string;
    onSuccess?: () => void;
}

export function ReviewDialog({
    bookingId,
    reviewee,
    revieweeName,
    propertyTitle,
    onSuccess,
}: ReviewDialogProps) {
    const { userData } = useAuth();
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState("");
    const [hasReviewedBooking, setHasReviewedBooking] = useState(false);

    // Check if user has already reviewed this booking
    const checkReviewed = async () => {
        if (!userData) return;
        const reviewed = await hasReviewed(bookingId, userData.profile.stxAddress.testnet);
        setHasReviewedBooking(reviewed);
    };

    // Submit review mutation
    const submitReviewMutation = useMutation({
        mutationFn: async () => {
            if (!userData) throw new Error("Not authenticated");
            if (rating === 0) throw new Error("Please select a rating");
            if (comment.trim().length === 0) throw new Error("Please write a comment");
            if (comment.length > 500) throw new Error("Comment must be 500 characters or less");

            const txOptions = await submitReview({
                bookingId,
                reviewee,
                rating,
                comment: comment.trim(),
            });

            await openContractCall({
                ...txOptions,
                network: NETWORK,
                onFinish: (data) => {
                    toast.success("Review submitted successfully!");
                    setOpen(false);
                    setRating(0);
                    setComment("");
                    onSuccess?.();
                },
                onCancel: () => {
                    toast.error("Review submission cancelled");
                },
            });
        },
        onError: (error: Error) => {
            console.error("Error submitting review:", error);
            toast.error(error.message || "Failed to submit review");
        },
    });

    const handleSubmit = () => {
        submitReviewMutation.mutate();
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            checkReviewed();
        }
        setOpen(newOpen);
    };

    if (hasReviewedBooking) {
        return (
            <Button variant="outline" size="sm" disabled>
                Already Reviewed
            </Button>
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Star className="w-4 h-4" />
                    Leave Review
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Leave a Review</DialogTitle>
                    <DialogDescription>
                        Share your experience with {revieweeName || "this booking"}
                        {propertyTitle && ` at ${propertyTitle}`}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Star Rating */}
                    <div className="space-y-2">
                        <Label>Rating</Label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                                >
                                    <Star
                                        className={`w-8 h-8 transition-colors ${star <= (hoveredRating || rating)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-muted-foreground"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-sm text-muted-foreground">
                                {rating === 1 && "Poor"}
                                {rating === 2 && "Fair"}
                                {rating === 3 && "Good"}
                                {rating === 4 && "Very Good"}
                                {rating === 5 && "Excellent"}
                            </p>
                        )}
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <Label htmlFor="comment">Your Review</Label>
                        <Textarea
                            id="comment"
                            placeholder="Share details about your experience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            maxLength={500}
                            rows={5}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground text-right">
                            {comment.length}/500 characters
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={submitReviewMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            rating === 0 ||
                            comment.trim().length === 0 ||
                            submitReviewMutation.isPending
                        }
                    >
                        {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
