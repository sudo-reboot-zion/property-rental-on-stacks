import {
    principalCV,
    uintCV,
    stringAsciiCV,
    fetchCallReadOnlyFunction,
    ClarityType,
    cvToValue,
} from "@stacks/transactions";

import { CONTRACT_ADDRESS, CONTRACTS, NETWORK } from './config';
import { rateLimiter } from './rate-limiter';

// Badge Types Constants (matching the contract)
export const BADGE_TYPES = {
    FIRST_BOOKING: 1,
    FIRST_LISTING: 2,
    SUPERHOST: 3,
    FREQUENT_TRAVELER: 4,
    EARLY_ADOPTER: 5,
    PERFECT_HOST: 6,
    GLOBE_TROTTER: 7,
    TOP_EARNER: 8,
} as const;

export type BadgeType = typeof BADGE_TYPES[keyof typeof BADGE_TYPES];

// Types
export interface BadgeMetadata {
    badgeType: number;
    owner: string;
    earnedAt: number;
    metadataUri: string;
}

export interface UserBadge {
    badgeId: number;
    earned: boolean;
}

export interface BadgeTypeInfo {
    name: string;
    description: string;
    imageUri: string;
    active: boolean;
}

// ============================================
// PUBLIC FUNCTIONS (Write Operations)
// ============================================

/**
 * Mint a badge for a recipient
 * Only contract owner can call this
 */
export async function mintBadge({
    recipient,
    badgeType,
    metadataUri,
}: {
    recipient: string;
    badgeType: number;
    metadataUri: string;
}) {
    return {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACTS.BADGE,
        functionName: "mint-badge",
        functionArgs: [
            principalCV(recipient),
            uintCV(badgeType),
            stringAsciiCV(metadataUri),
        ],
    };
}

// ============================================
// READ-ONLY FUNCTIONS
// ============================================

/**
 * Get badge metadata by badge ID
 */
export async function getBadgeMetadata(badgeId: number): Promise<BadgeMetadata | null> {
    try {
        const result = await rateLimiter.add(() => fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACTS.BADGE,
            functionName: "get-badge-metadata",
            functionArgs: [uintCV(badgeId)],
            senderAddress: CONTRACT_ADDRESS,
            network: NETWORK,
        }));

        if (result.type === ClarityType.OptionalNone) {
            return null;
        }

        if (result.type !== ClarityType.OptionalSome || !result.value) {
            return null;
        }

        const data = cvToValue(result.value);
        console.log(`🔍 getBadgeMetadata(${badgeId}) raw data:`, data);

        // Handle potential object structure
        const badgeTypeRaw = data["badge-type"];
        const earnedAtRaw = data["earned-at"];

        const badgeType = typeof badgeTypeRaw === 'object' && badgeTypeRaw?.value ? badgeTypeRaw.value : badgeTypeRaw;
        const earnedAt = typeof earnedAtRaw === 'object' && earnedAtRaw?.value ? earnedAtRaw.value : earnedAtRaw;

        return {
            badgeType: Number(badgeType),
            owner: data.owner,
            earnedAt: Number(earnedAt),
            metadataUri: data["metadata-uri"],
        };
    } catch (error) {
        console.error("Error fetching badge metadata:", error);
        return null;
    }
}

/**
 * Check if a user has a specific badge type
 */
export async function hasBadge(user: string, badgeType: number): Promise<boolean> {
    try {
        const result = await rateLimiter.add(() => fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACTS.BADGE,
            functionName: "has-badge",
            functionArgs: [principalCV(user), uintCV(badgeType)],
            senderAddress: CONTRACT_ADDRESS,
            network: NETWORK,
        }));

        return result.type === ClarityType.BoolTrue;
    } catch (error) {
        console.error("Error checking if user has badge:", error);
        return false;
    }
}

/**
 * Get a user's specific badge by type
 */
export async function getUserBadge(
    user: string,
    badgeType: number
): Promise<UserBadge | null> {
    try {
        const result = await rateLimiter.add(() => fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACTS.BADGE,
            functionName: "get-user-badge",
            functionArgs: [principalCV(user), uintCV(badgeType)],
            senderAddress: CONTRACT_ADDRESS,
            network: NETWORK,
        }));

        if (result.type === ClarityType.OptionalNone) {
            return null;
        }

        if (result.type !== ClarityType.OptionalSome || !result.value) {
            return null;
        }

        const data = cvToValue(result.value);
        console.log(`🔍 getUserBadge(${user}, ${badgeType}) raw data:`, data);

        // Handle potential object structure from cvToValue
        const badgeIdRaw = data["badge-id"];
        const earnedRaw = data.earned;

        const badgeId = typeof badgeIdRaw === 'object' && badgeIdRaw?.value ? badgeIdRaw.value : badgeIdRaw;
        const earned = typeof earnedRaw === 'object' && earnedRaw?.value ? earnedRaw.value : earnedRaw;

        return {
            badgeId: Number(badgeId),
            earned: earned === true || earned === 'true',
        };
    } catch (error) {
        // console.error("Error fetching user badge:", error);
        return null;
    }
}

/**
 * Get badge type information
 */
export async function getBadgeTypeInfo(badgeType: number): Promise<BadgeTypeInfo | null> {
    try {
        const result = await rateLimiter.add(() => fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACTS.BADGE,
            functionName: "get-badge-type-info",
            functionArgs: [uintCV(badgeType)],
            senderAddress: CONTRACT_ADDRESS,
            network: NETWORK,
        }));

        if (result.type === ClarityType.OptionalNone) {
            return null;
        }

        if (result.type !== ClarityType.OptionalSome || !result.value) {
            return null;
        }

        const data = cvToValue(result.value);

        return {
            name: data.name,
            description: data.description,
            imageUri: data["image-uri"],
            active: data.active,
        };
    } catch (error) {
        console.error(`Error fetching badge type info for ${badgeType}:`, error);
        return null;
    }
}

/**
 * Get the owner of a badge NFT
 */
export async function getOwner(badgeId: number): Promise<string | null> {
    try {
        const result = await rateLimiter.add(() => fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACTS.BADGE,
            functionName: "get-owner",
            functionArgs: [uintCV(badgeId)],
            senderAddress: CONTRACT_ADDRESS,
            network: NETWORK,
        }));

        if (result.type !== ClarityType.ResponseOk) {
            return null;
        }

        const ownerData = cvToValue(result.value);

        // The result is an optional, so check if it exists
        if (ownerData === null) {
            return null;
        }

        return ownerData as string;
    } catch (error) {
        console.error("Error fetching badge owner:", error);
        return null;
    }
}

/**
 * Get token URI for a badge (for NFT marketplaces)
 */
export async function getTokenUri(badgeId: number): Promise<string | null> {
    try {
        const result = await rateLimiter.add(() => fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACTS.BADGE,
            functionName: "get-token-uri",
            functionArgs: [uintCV(badgeId)],
            senderAddress: CONTRACT_ADDRESS,
            network: NETWORK,
        }));

        if (result.type !== ClarityType.ResponseOk) {
            return null;
        }

        const uriData = cvToValue(result.value);

        // The result is an optional, so check if it exists
        if (uriData === null) {
            return null;
        }

        return uriData as string;
    } catch (error) {
        console.error("Error fetching token URI:", error);
        return null;
    }
}

/**
 * Get total number of badges minted
 */
export async function getTotalBadges(): Promise<number> {
    try {
        const result = await rateLimiter.add(() => fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACTS.BADGE,
            functionName: "get-total-badges",
            functionArgs: [],
            senderAddress: CONTRACT_ADDRESS,
            network: NETWORK,
        }));

        if (result.type !== ClarityType.ResponseOk) {
            return 0;
        }

        const count = cvToValue(result.value);
        return Number(count);
    } catch (error) {
        console.error("Error fetching total badges:", error);
        return 0;
    }
}

/**
 * Get all badges for a specific user
 */

export async function getAllUserBadges(user: string): Promise<(BadgeMetadata & { id: number })[]> {
    try {
        const results: (BadgeMetadata & { id: number })[] = [];
        const badgeTypes = Object.values(BADGE_TYPES);

        // Fetch in parallel using Promise.all
        const userBadges = await Promise.all(
            badgeTypes.map(async (badgeType) => {
                const userBadge = await getUserBadge(user, badgeType);
                console.log(`🔍 Checking badge type ${badgeType} for user ${user}:`, userBadge);
                return userBadge;
            })
        );

        // Process results
        for (const userBadge of userBadges) {
            if (userBadge && userBadge.earned) {
                const metadata = await getBadgeMetadata(userBadge.badgeId);
                if (metadata) {
                    results.push({
                        id: userBadge.badgeId,
                        ...metadata,
                    });
                }
            }
        }

        return results;
    } catch (error) {
        console.error("Error fetching all user badges:", error);
        return [];
    }
}

/**
 * Get all badge type information
 */
export async function getAllBadgeTypes(): Promise<(BadgeTypeInfo & { type: BadgeType })[]> {
    try {
        const results: (BadgeTypeInfo & { type: BadgeType })[] = [];
        const types = Object.values(BADGE_TYPES);

        // Fetch sequentially to avoid rate limits
        for (const type of types) {
            const info = await getBadgeTypeInfo(type);
            if (info) {
                results.push({
                    type: type as BadgeType,
                    ...info,
                });
            }
            // Rate limiter handles delay
        }

        return results;
    } catch (error) {
        console.error("Error fetching all badge types:", error);
        return [];
    }
}
