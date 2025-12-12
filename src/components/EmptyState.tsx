import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import BlockchainIllustration from "./BlockchainIllustration";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    children?: ReactNode;
    className?: string;
    showBlockchainIllustration?: boolean;
}

const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
    children,
    className = "",
    showBlockchainIllustration = true,
}: EmptyStateProps) => {
    return (
        <div className={`flex flex-col items-center justify-center py-20 px-4 relative ${className}`}>
            {/* Background Blockchain Illustration */}
            {showBlockchainIllustration && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <BlockchainIllustration />
                </div>
            )}

            {/* Animated Icon Container */}
            <div className="relative mb-8 animate-fade-in z-10">
                <div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r from-primary via-accent to-primary animate-pulse"></div>
                <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 flex items-center justify-center border border-border/50 backdrop-blur-sm">
                    <div className="absolute inset-2 rounded-2xl bg-background/50"></div>
                    <Icon className="w-16 h-16 text-muted-foreground relative z-10 animate-float" strokeWidth={1.5} />
                </div>
            </div>

            {/* Content */}
            <div className="text-center max-w-md space-y-4 animate-slide-up z-10">
                <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{description}</p>

                {action && (
                    <div className="pt-4">
                        <Button
                            onClick={action.onClick}
                            size="lg"
                            className="gradient-hero text-primary-foreground font-semibold shadow-elegant hover:shadow-glow transition-smooth h-12 px-8 rounded-xl"
                        >
                            {action.label}
                        </Button>
                    </div>
                )}

                {children && <div className="pt-4">{children}</div>}
            </div>

            {/* Decorative Elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
            </div>
        </div>
    );
};

export default EmptyState;
