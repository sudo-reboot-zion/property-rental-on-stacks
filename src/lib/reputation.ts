import {
    principalCV,
    uintCV,
    stringUtf8CV,
    fetchCallReadOnlyFunction,
    ClarityType,
    cvToValue,
} from "@stacks/transactions";

import { CONTRACT_ADDRESS, CONTRACTS, NETWORK } from './config';

// Rating Constants
export const MIN_RATING = 1;
export const MAX_RATING = 5;

// Types
export interface Review {
    bookingId: number;
    reviewer: string;
    reviewee: string;
    rating: number;
    comment: string;
    createdAt: number;
}

export interface UserStats {
    totalReviews: number;
    totalRatingSum: number;
    averageRating: number; // Stored as rating * 100 (e.g., 4.5 = 450)
}

// ============================================
// PUBLIC FUNCTIONS (Write Operations)
// ============================================

/**
 * Submit a review for a booking
 */
export async function submitReview({
    bookingId,
    reviewee,
    rating,
    comment,
}: {
    bookingId: number;
    reviewee: string;
    rating: number;
    comment: string;
}) {
    return {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACTS.REPUTATION,
        functionName: "submit-review",
        functionArgs: [
            uintCV(bookingId),
            principalCV(reviewee),
            uintCV(rating),
            stringUtf8CV(comment),
        ],
    };
}

// ============================================
// READ-ONLY FUNCTIONS
// ============================================

/**
 * Get a specific review by review ID
 */
export async function getReview(reviewId: number): Promise<Review | null> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACTS.REPUTATION,
            functionName: "get-review",
            functionArgs: [uintCV(reviewId)],
            senderAddress: CONTRACT_ADDRESS,
            network: NETWORK,
        });

        if (result.type === ClarityType.OptionalNone) {
            return null;
        }

        if (result.type !== ClarityType.OptionalSome || !result.value) {
            return null;
        }

        const data = cvToValue(result.value);

        return {
            bookingId: Number(data["booking-id"]),
            reviewer: data.reviewer,
            reviewee: data.reviewee,
            rating: Number(data.rating),
            comment: data.comment,
            createdAt: Number(data["created-at"]),
        };
    } catch (error) {
        console.error("Error fetching review:", error);
        return null;
    }
}

/**
 * Get user statistics (reviews received)
 */
export async function getUserStats(user: string): Promise<UserStats | null> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACTS.REPUTATION,
            functionName: "get-user-stats",
            functionArgs: [principalCV(user)],
            senderAddress: CONTRACT_ADDRESS,
            network: NETWORK,
        });

        if (result.type === ClarityType.OptionalNone) {
            return null;
        }

        if (result.type !== ClarityType.OptionalSome || !result.value) {
            return null;
        }

        const data = cvToValue(result.value);

        return {
            totalReviews: Number(data["total-reviews"]),
            totalRatingSum: Number(data["total-rating-sum"]),
            averageRating: Number(data["average-rating"]),
        };
    } catch (error) {
        console.error("Error fetching user stats:", error);
        return null;
    }
}

/**
 * Check if a user has reviewed a specific booking
 */
export async function hasReviewed(bookingId: number, reviewer: string): Promise<boolean> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACTS.REPUTATION,
            functionName: "has-reviewed",
            functionArgs: [uintCV(bookingId), principalCV(reviewer)],
            senderAddress: CONTRACT_ADDRESS,
            network: NETWORK,
        });

        return result.type === ClarityType.BoolTrue;
    } catch (error) {
        console.error("Error checking if user has reviewed:", error);
        return false;
    }
}

/**
 * Get total number of reviews
 */
export async function getReviewCount(): Promise<number> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACTS.REPUTATION,
            functionName: "get-review-count",
            functionArgs: [],
            senderAddress: CONTRACT_ADDRESS,
            network: NETWORK,
        });

        if (result.type !== ClarityType.ResponseOk) {
            return 0;
        }

        const count = cvToValue(result.value);
        return Number(count);
    } catch (error) {
        console.error("Error fetching review count:", error);
        return 0;
    }
}

/**
 * Get average rating for a user (returns rating * 100)
 */
export async function getUserAverageRating(user: string): Promise<number> {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACTS.REPUTATION,
            functionName: "get-user-average-rating",
            functionArgs: [principalCV(user)],
            senderAddress: CONTRACT_ADDRESS,
            network: NETWORK,
        });

        if (result.type !== ClarityType.ResponseOk) {
            return 0;
        }

        const rating = cvToValue(result.value);
        return Number(rating);
    } catch (error) {
        console.error("Error fetching user average rating:", error);
        return 0;
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get all reviews
 */
export async function getAllReviews(): Promise<(Review & { id: number })[]> {
    try {
        const reviewCount = await getReviewCount();

        console.log('📊 Total reviews from contract:', reviewCount);

        if (reviewCount === 0) {
            console.log('⚠️ No reviews found');
            return [];
        }

        const reviews: (Review & { id: number })[] = [];

        for (let i = 0; i < reviewCount; i++) {
            console.log(`🔍 Fetching review ${i}...`);
            const review = await getReview(i);

            if (review) {
                console.log(`✅ Review ${i} fetched`);
                reviews.push({
                    id: i,
                    ...review,
                });
            } else {
                console.warn(`⚠️ Review ${i} returned null`);
            }
        }

        console.log('✨ Final reviews array:', reviews.length, 'reviews');
        return reviews;
    } catch (error) {
        console.error("❌ Error fetching all reviews:", error);
        return [];
    }
}

/**
 * Get all reviews for a specific user (as reviewee)
 */
export async function getUserReviews(user: string): Promise<(Review & { id: number })[]> {
    try {
        const allReviews = await getAllReviews();

        // Filter reviews where the user is the reviewee
        const userReviews = allReviews.filter(review => review.reviewee === user);

        console.log('✨ Found', userReviews.length, 'reviews for user', user);
        return userReviews;
    } catch (error) {
        console.error("❌ Error fetching user reviews:", error);
        return [];
    }
}

/**
 * Get reviews written by a specific user (as reviewer)
 */
export async function getReviewsByUser(user: string): Promise<(Review & { id: number })[]> {
    try {
        const allReviews = await getAllReviews();

        // Filter reviews where the user is the reviewer
        const reviewsByUser = allReviews.filter(review => review.reviewer === user);

        console.log('✨ Found', reviewsByUser.length, 'reviews written by user', user);
        return reviewsByUser;
    } catch (error) {
        console.error("❌ Error fetching reviews by user:", error);
        return [];
    }
}

/**
 * Get reviews for a specific booking
 */
export async function getBookingReviews(bookingId: number): Promise<(Review & { id: number })[]> {
    try {
        const allReviews = await getAllReviews();

        // Filter reviews for the specific booking
        const bookingReviews = allReviews.filter(review => review.bookingId === bookingId);

        console.log('✨ Found', bookingReviews.length, 'reviews for booking', bookingId);
        return bookingReviews;
    } catch (error) {
        console.error("❌ Error fetching booking reviews:", error);
        return [];
    }
}

/**
 * Convert average rating from contract format (rating * 100) to decimal
 * Example: 450 -> 4.5
 */
export function formatAverageRating(ratingTimes100: number): number {
    return ratingTimes100 / 100;
}

/**
 * Get user's formatted average rating
 */
export async function getUserFormattedRating(user: string): Promise<number> {
    const rating = await getUserAverageRating(user);
    return formatAverageRating(rating);
}
