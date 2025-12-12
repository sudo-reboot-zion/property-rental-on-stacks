import { useState, useEffect, useCallback, createElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import {
    getAllUserBadges,
    getAllBadgeTypes,
    hasBadge as checkHasBadge,
    BADGE_TYPES as BADGE_TYPES_CONST,
    type BadgeMetadata,
    type BadgeTypeInfo,
} from "@/lib/badge";
import { Award, Home, Star, Plane, Zap, Trophy, Globe, DollarSign, LucideIcon } from "lucide-react";

// Re-export BADGE_TYPES for convenience
export const BADGE_TYPES = BADGE_TYPES_CONST;

// Extended badge type with UI properties
export interface BadgeWithUI extends BadgeMetadata {
    id: number;
    typeInfo: BadgeTypeInfo | null;
    icon: React.ReactNode;
    color: string;
}

// Badge type to icon component mapping
const BADGE_ICON_COMPONENTS: Record<number, LucideIcon> = {
    [BADGE_TYPES.FIRST_BOOKING]: Award,
    [BADGE_TYPES.FIRST_LISTING]: Home,
    [BADGE_TYPES.SUPERHOST]: Star,
    [BADGE_TYPES.FREQUENT_TRAVELER]: Plane,
    [BADGE_TYPES.EARLY_ADOPTER]: Zap,
    [BADGE_TYPES.PERFECT_HOST]: Trophy,
    [BADGE_TYPES.GLOBE_TROTTER]: Globe,
    [BADGE_TYPES.TOP_EARNER]: DollarSign,
};

// Helper function to get badge icon
const getBadgeIcon = (badgeType: number): React.ReactNode => {
    const IconComponent = BADGE_ICON_COMPONENTS[badgeType] || Award;
    return createElement(IconComponent, { className: "w-8 h-8" });
};

// Badge type to color mapping
const BADGE_COLORS: Record<number, string> = {
    [BADGE_TYPES.FIRST_BOOKING]: "#a855f7", // purple
    [BADGE_TYPES.FIRST_LISTING]: "#3b82f6", // blue
    [BADGE_TYPES.SUPERHOST]: "#eab308", // yellow
    [BADGE_TYPES.FREQUENT_TRAVELER]: "#06b6d4", // cyan
    [BADGE_TYPES.EARLY_ADOPTER]: "#8b5cf6", // violet
    [BADGE_TYPES.PERFECT_HOST]: "#f59e0b", // amber
    [BADGE_TYPES.GLOBE_TROTTER]: "#10b981", // emerald
    [BADGE_TYPES.TOP_EARNER]: "#22c55e", // green
};

/**
 * Custom hook for managing badge data
 * Fetches user badges and badge type information from the blockchain
 */
export function useBadges(userAddress?: string) {
    const { userData } = useAuth();
    const targetAddress = userAddress || userData?.profile.stxAddress.testnet;

    // Fetch badge types (rarely changes, cache for a long time)
    const { data: allBadgeTypes = [] } = useQuery({
        queryKey: ["badge-types"],
        queryFn: async () => {
            console.log("📋 Fetching all badge types...");
            return getAllBadgeTypes();
        },
        staleTime: Infinity, // Cache forever during session
        refetchOnWindowFocus: false,
    });

    // Fetch user badges
    const {
        data: badges = [],
        isLoading,
        error,
        refetch: refetchBadges
    } = useQuery({
        queryKey: ["user-badges", targetAddress],
        enabled: !!targetAddress,
        queryFn: async () => {
            if (!targetAddress) return [];

            console.log(`🎖️ Fetching badges for ${targetAddress}...`);
            const userBadges = await getAllUserBadges(targetAddress);
            console.log(`✅ Found ${userBadges.length} badges for user ${targetAddress}:`, userBadges);

            // Enhance badges with UI properties
            return userBadges.map((badge) => {
                const typeInfo = allBadgeTypes.find(t => t.type === badge.badgeType);

                return {
                    ...badge,
                    typeInfo: typeInfo || null,
                    icon: getBadgeIcon(badge.badgeType),
                    color: BADGE_COLORS[badge.badgeType] || "#a855f7",
                };
            });
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        retry: 2,
    });

    /**
     * Check if user has a specific badge type
     */
    const hasBadge = useCallback(
        async (badgeType: number): Promise<boolean> => {
            if (!targetAddress) return false;
            // Check cache first
            const cachedBadge = badges.find(b => b.badgeType === badgeType);
            if (cachedBadge) return true;

            try {
                return await checkHasBadge(targetAddress, badgeType);
            } catch (err) {
                console.error(`Error checking badge ${badgeType}:`, err);
                return false;
            }
        },
        [targetAddress, badges]
    );

    return {
        badges,
        allBadgeTypes,
        isLoading,
        error: error instanceof Error ? error.message : error ? String(error) : null,
        hasBadge,
        refetchBadges,
        BADGE_TYPES,
    };
}