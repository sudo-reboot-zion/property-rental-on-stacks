import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Copy, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface WalletAddressProps {
    address: string;
    className?: string;
}

export const WalletAddress = ({ address, className }: WalletAddressProps) => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState("");

    useEffect(() => {
        // Generate a consistent avatar based on address
        // In a real app, use a library like 'jazzicon' or 'blockies'
        // For now, we'll use a deterministic dicebear avatar
        setAvatarUrl(`https://api.dicebear.com/7.x/identicon/svg?seed=${address}`);
    }, [address]);

    const truncateAddress = (addr: string) => {
        if (!addr) return "";
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const copyToClipboard = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="group relative flex items-center gap-3 pl-1 pr-4 py-1.5 bg-background/50 backdrop-blur-md border border-border/50 rounded-full transition-all duration-300 shadow-sm  cursor-default">

                {/* Avatar */}
                <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-background shadow-sm  transition-transform duration-300">
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-full"></div>
                </div>

                {/* Address & Status */}
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground tracking-tight flex items-center gap-1.5 transition-colors ">
                        {truncateAddress(address)}
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        {t('wallet.connected')}
                    </span>
                </div>

                {/* Actions (reveal on hover) */}
                <div className="absolute right-1 opacity-0  transition-all duration-300 translate-x-2  flex items-center gap-1 bg-background/95 backdrop-blur-sm rounded-full px-1 shadow-sm border border-border/50">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-full  hover:text-primary transition-colors"
                                    onClick={copyToClipboard}
                                >
                                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{copied ? t('wallet.copied') : t('wallet.copyAddress')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </div>
    );
};
