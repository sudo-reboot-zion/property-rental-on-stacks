import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Review } from "@/lib/reputation";

interface ReviewCardProps {
    review: Review & { id: number };
}

export function ReviewCard({ review }: ReviewCardProps) {
    // Format the reviewer address for display
    const reviewerShort = `${review.reviewer.slice(0, 6)}...${review.reviewer.slice(-4)}`;

    // Format timestamp (block height to approximate date)
    // This is a rough approximation - 1 block ≈ 10 minutes
    const formatBlockHeight = (blockHeight: number) => {
        const currentBlock = 100000; // TODO: Get from API
        const blocksDiff = currentBlock - blockHeight;
        const minutesAgo = blocksDiff * 10;

        if (minutesAgo < 60) return `${Math.floor(minutesAgo)} minutes ago`;
        if (minutesAgo < 1440) return `${Math.floor(minutesAgo / 60)} hours ago`;
        return `${Math.floor(minutesAgo / 1440)} days ago`;
    };

    return (
        <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
            <CardContent className="p-4">
                <div className="flex gap-4">
                    {/* Avatar */}
                    <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {review.reviewer.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                                <p className="font-medium text-sm">{reviewerShort}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatBlockHeight(review.createdAt)}
                                </p>
                            </div>
                            {/* Star Rating */}
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-4 h-4 ${star <= review.rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-muted-foreground/30"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Comment */}
                        <p className="text-sm text-foreground/90 leading-relaxed">
                            {review.comment}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
