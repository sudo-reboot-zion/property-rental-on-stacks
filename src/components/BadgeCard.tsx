import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";

// Badge metadata with visual styling
const BADGE_INFO = {
    1: { // FIRST_BOOKING
        name: "First Booking",
        description: "Completed your first booking",
        icon: "🎉",
        gradient: "from-blue-500 to-cyan-500",
    },
    2: { // FIRST_LISTING
        name: "Property Pioneer",
        description: "Listed your first property",
        icon: "🏠",
        gradient: "from-green-500 to-emerald-500",
    },
    3: { // SUPERHOST
        name: "Superhost",
        description: "5-star rating with 10+ reviews",
        icon: "⭐",
        gradient: "from-yellow-500 to-orange-500",
    },
    4: { // FREQUENT_TRAVELER
        name: "Frequent Traveler",
        description: "Completed 10 bookings",
        icon: "✈️",
        gradient: "from-purple-500 to-pink-500",
    },
    5: { // EARLY_ADOPTER
        name: "Early Adopter",
        description: "One of the first 1000 users",
        icon: "🚀",
        gradient: "from-indigo-500 to-blue-500",
    },
    6: { // PERFECT_HOST
        name: "Perfect Host",
        description: "20 bookings, zero cancellations",
        icon: "💎",
        gradient: "from-teal-500 to-cyan-500",
    },
    7: { // GLOBE_TROTTER
        name: "Globe Trotter",
        description: "Stayed in 5+ countries",
        icon: "🌍",
        gradient: "from-rose-500 to-pink-500",
    },
    8: { // TOP_EARNER
        name: "Top Earner",
        description: "Top 10 host by revenue",
        icon: "💰",
        gradient: "from-amber-500 to-yellow-500",
    },
} as const;

interface BadgeCardProps {
    badgeType: number;
    earnedAt?: number;
    size?: "sm" | "md" | "lg";
    showDescription?: boolean;
}

export function BadgeCard({ badgeType, earnedAt, size = "md", showDescription = true }: BadgeCardProps) {
    const badge = BADGE_INFO[badgeType as keyof typeof BADGE_INFO];

    if (!badge) return null;

    const sizeClasses = {
        sm: "w-16 h-16 text-2xl",
        md: "w-20 h-20 text-3xl",
        lg: "w-24 h-24 text-4xl",
    };

    const cardSizeClasses = {
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
    };

    return (
        <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.05, y: -5 }}
        >
            <Card className={`${cardSizeClasses[size]} border-border/50 bg-gradient-to-br ${badge.gradient} relative overflow-hidden group cursor-pointer`}>
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Badge icon */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm shadow-lg`}>
                        <span>{badge.icon}</span>
                    </div>

                    {showDescription && (
                        <div className="text-center">
                            <h3 className="font-bold text-white text-sm">{badge.name}</h3>
                            <p className="text-xs text-white/80 mt-0.5">{badge.description}</p>
                        </div>
                    )}

                    {earnedAt && (
                        <div className="text-xs text-white/60 mt-1">
                            Block #{earnedAt}
                        </div>
                    )}
                </div>

                {/* Trophy icon in corner */}
                <Trophy className="absolute top-2 right-2 w-4 h-4 text-white/40" />
            </Card>
        </motion.div>
    );
}
