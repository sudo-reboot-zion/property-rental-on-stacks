import { Award, Loader2 } from "lucide-react";

interface NoBadgesProps {
    isLoading?: boolean;
}

const NoBadges = ({ isLoading = false }: NoBadgesProps) => {
    if (isLoading) {
        return (
            <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">Loading badges...</p>
            </div>
        );
    }

    return (
        <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
            {/* Animated Icon Container */}
            <div className="relative mb-6 animate-fade-in">
                <div className="absolute inset-0 blur-2xl opacity-20 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-pulse"></div>
                <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 flex items-center justify-center border border-purple-500/20 backdrop-blur-sm">
                    <div className="absolute inset-2 rounded-xl bg-background/30"></div>
                    <Award className="w-12 h-12 text-purple-400 relative z-10" strokeWidth={1.5} />
                </div>
            </div>

            {/* Content */}
            <div className="text-center max-w-md space-y-3 animate-slide-up">
                <h3 className="text-xl font-bold tracking-tight">No Badges Earned Yet</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Complete bookings, host properties, and engage with the community to unlock exclusive badges and achievements!
                </p>
            </div>

            {/* Decorative glow */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
            </div>
        </div>
    );
};

export default NoBadges;
