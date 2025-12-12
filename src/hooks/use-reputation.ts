import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";
import { openContractCall } from "@stacks/connect";
import {
    getUserStats,
    getUserReviews,
    submitReview as submitReviewTx,
    hasReviewed as checkHasReviewed,
    formatAverageRating,
    type UserStats,
    type Review,
} from "@/lib/reputation";

export interface ReputationData {
    stats: UserStats | null;
    formattedRating: number;
    reviews: (Review & { id: number })[];
}

export function useReputation(userAddress?: string) {
    const { userData } = useAuth();
    const { toast } = useToast();

    const [reputationData, setReputationData] = useState<ReputationData>({
        stats: null,
        formattedRating: 0,
        reviews: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use provided address or fall back to authenticated user's address
    const targetAddress = userAddress || userData?.profile.stxAddress.testnet;

    /**
     * Fetch user reputation stats and reviews
     */
    const fetchReputationData = useCallback(async () => {
        if (!targetAddress) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log(`⭐ Fetching reputation for ${targetAddress}...`);

            const [stats, reviews] = await Promise.all([
                getUserStats(targetAddress),
                getUserReviews(targetAddress)
            ]);

            const formattedRating = stats ? formatAverageRating(stats.averageRating) : 0;

            setReputationData({
                stats,
                formattedRating,
                reviews,
            });

            console.log(`✅ Loaded reputation: ${formattedRating} stars, ${reviews.length} reviews`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch reputation data";
            setError(errorMessage);
            console.error("Error fetching reputation:", err);
        } finally {
            setIsLoading(false);
        }
    }, [targetAddress]);

    /**
     * Check if current user has reviewed a booking
     */
    const hasReviewed = useCallback(async (bookingId: number): Promise<boolean> => {
        if (!userData?.profile.stxAddress.testnet) return false;
        return await checkHasReviewed(bookingId, userData.profile.stxAddress.testnet);
    }, [userData]);

    /**
     * Submit a new review
     */
    const submitReview = async (
        bookingId: number,
        reviewee: string,
        rating: number,
        comment: string
    ) => {
        if (!userData) {
            toast({
                title: "Authentication Required",
                description: "Please connect your wallet to submit a review",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const txOptions = await submitReviewTx({
                bookingId,
                reviewee,
                rating,
                comment,
            });

            await openContractCall({
                ...txOptions,
                onFinish: (data) => {
                    console.log("✅ Review transaction submitted:", data);
                    toast({
                        title: "Review Submitted",
                        description: "Your review has been submitted to the blockchain!",
                    });
                    setIsSubmitting(false);
                },
                onCancel: () => {
                    setIsSubmitting(false);
                },
            });
        } catch (err) {
            console.error("Error submitting review:", err);
            toast({
                title: "Error",
                description: "Failed to submit review",
                variant: "destructive",
            });
            setIsSubmitting(false);
        }
    };

    /**
     * Initial fetch
     */
    useEffect(() => {
        fetchReputationData();
    }, [fetchReputationData]);

    return {
        ...reputationData,
        isLoading,
        isSubmitting,
        error,
        refetchReputation: fetchReputationData,
        submitReview,
        hasReviewed,
    };
}
