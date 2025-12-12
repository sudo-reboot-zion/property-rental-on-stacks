import { useQuery } from "@tanstack/react-query";
import { Star, MessageSquare } from "lucide-react";
import { getUserReviews, formatAverageRating } from "@/lib/reputation";
import { ReviewCard } from "@/components/ReviewCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ReviewsListProps {
    userAddress: string; // The reviewee (property owner or guest being reviewed)
    title?: string;
}

export function ReviewsList({ userAddress, title = "Reviews" }: ReviewsListProps) {
    const { data: reviews = [], isLoading } = useQuery({
        queryKey: ["user-reviews", userAddress],
        queryFn: () => getUserReviews(userAddress),
    });

    // Calculate average rating
    const averageRating =
        reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

    if (isLoading) {
        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">{title}</h2>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">{title}</h2>
                <div className="text-center py-12 border border-dashed border-border/50 rounded-lg bg-muted/20">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No reviews yet</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                        Be the first to leave a review!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{title}</h2>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-lg">{averageRating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">
                        ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                    </span>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-3">
                {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                ))}
            </div>
        </div>
    );
}
