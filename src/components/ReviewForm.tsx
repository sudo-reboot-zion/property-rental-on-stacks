import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { openContractCall } from "@stacks/connect";
import { submitReview } from "@/lib/reputation";

interface ReviewFormProps {
    bookingId: number;
    revieweeAddress: string; // The person being reviewed (host or guest)
    onSuccess?: () => void;
    trigger?: React.ReactNode;
}

export function ReviewForm({ bookingId, revieweeAddress, onSuccess, trigger }: ReviewFormProps) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast({
                title: "Rating Required",
                description: "Please select a star rating",
                variant: "destructive",
            });
            return;
        }

        if (comment.trim().length < 10) {
            toast({
                title: "Comment Too Short",
                description: "Please write at least 10 characters",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const contractCallOptions = await submitReview({
                bookingId,
                reviewee: revieweeAddress,
                rating,
                comment,
            });

            await openContractCall({
                ...contractCallOptions,
                onFinish: async (data) => {
                    toast({
                        title: "Review Submitted",
                        description: "Your review has been submitted to the blockchain.",
                    });
                    setIsOpen(false);
                    onSuccess?.();
                },
                onCancel: () => {
                    setIsSubmitting(false);
                },
            });
        } catch (error) {
            console.error("Error submitting review:", error);
            toast({
                title: "Error",
                description: "Failed to submit review",
                variant: "destructive",
            });
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline">Leave Review</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Leave a Review</DialogTitle>
                    <DialogDescription>
                        Share your experience. This will be permanently recorded on the blockchain.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="focus:outline-none transition-transform hover:scale-110"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                            >
                                <Star
                                    className={`w-8 h-8 ${star <= (hoverRating || rating)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-muted-foreground/30"
                                        } transition-colors`}
                                />
                            </button>
                        ))}
                    </div>
                    <div className="text-center text-sm font-medium text-muted-foreground h-5">
                        {hoverRating > 0 ? (
                            hoverRating === 1 ? "Poor" :
                                hoverRating === 2 ? "Fair" :
                                    hoverRating === 3 ? "Good" :
                                        hoverRating === 4 ? "Very Good" : "Excellent"
                        ) : rating > 0 ? (
                            rating === 1 ? "Poor" :
                                rating === 2 ? "Fair" :
                                    rating === 3 ? "Good" :
                                        rating === 4 ? "Very Good" : "Excellent"
                        ) : "Select a rating"}
                    </div>
                    <Textarea
                        placeholder="Write your review here..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0 || comment.length < 10}>
                        {isSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
