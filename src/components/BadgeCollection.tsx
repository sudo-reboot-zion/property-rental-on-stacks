import { Trophy, Lock, RefreshCw, HelpCircle } from "lucide-react";
import { BADGE_TYPES } from "@/lib/badge";
import { BadgeCard } from "@/components/BadgeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBadges } from "@/hooks/use-badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface BadgeCollectionProps {
    userAddress: string;
    title?: string;
    showLocked?: boolean;
}

export function BadgeCollection({ userAddress, title = "Achievements", showLocked = true }: BadgeCollectionProps) {
    const { badges: earnedBadges, isLoading, error, refetchBadges } = useBadges(userAddress);

    // Create a set of earned badge types for quick lookup
    const earnedBadgeTypes = new Set(earnedBadges.map(b => b.badgeType));

    // All possible badge types
    const allBadgeTypes = Object.values(BADGE_TYPES);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-primary" />
                        {title}
                    </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-primary" />
                        {title}
                    </h2>
                </div>
                <div className="p-6 border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/50 rounded-lg text-center">
                    <p className="text-red-600 dark:text-red-400 mb-4">Failed to load badges: {error}</p>
                    <Button variant="outline" onClick={() => refetchBadges()}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-primary" />
                        {title}
                    </h2>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <HelpCircle className="w-4 h-4 text-muted-foreground/70" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                <p>Earn badges by listing properties, completing bookings, and maintaining a high reputation. Badges are minted automatically to your wallet.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground hidden sm:block">
                        {earnedBadges.length} of {allBadgeTypes.length} earned
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => refetchBadges()} title="Refresh Badges">
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Badge Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {allBadgeTypes.map((badgeType) => {
                    const earnedBadge = earnedBadges.find(b => b.badgeType === badgeType);
                    const isEarned = earnedBadgeTypes.has(badgeType);

                    if (isEarned && earnedBadge) {
                        // Show earned badge
                        return (
                            <BadgeCard
                                key={badgeType}
                                badgeType={badgeType}
                                earnedAt={earnedBadge.earnedAt}
                                size="md"
                                showDescription={true}
                            />
                        );
                    }

                    if (showLocked) {
                        // Show locked badge placeholder
                        return (
                            <Card
                                key={badgeType}
                                className="p-4 border-border/50 bg-muted/20 relative overflow-hidden opacity-50"
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-20 h-20 flex items-center justify-center rounded-full bg-muted/50">
                                        <Lock className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-bold text-sm text-muted-foreground">Locked</h3>
                                        <p className="text-xs text-muted-foreground/60 mt-0.5">Not yet earned</p>
                                    </div>
                                </div>
                            </Card>
                        );
                    }

                    return null;
                })}
            </div>

            {/* Empty State */}
            {earnedBadges.length === 0 && (
                <div className="text-center py-12 border border-dashed border-border/50 rounded-lg bg-muted/20">
                    <Trophy className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Badges Yet</h3>
                    <p className="text-muted-foreground mb-4">
                        Complete bookings and listings to earn achievement badges!
                    </p>
                    <Button variant="outline" onClick={() => refetchBadges()}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Check Again
                    </Button>
                </div>
            )}
        </div>
    );
}
