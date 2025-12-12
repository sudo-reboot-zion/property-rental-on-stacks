import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { User, Calendar, History, LogOut, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { WalletAddress } from "./WalletAddress";

interface UserMenuProps {
    address: string;
    onDisconnect: () => void;
}

export const UserMenu = ({ address, onDisconnect }: UserMenuProps) => {
    const { t } = useTranslation();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="stacker" className="gap-2 px-2">
                    <WalletAddress address={address} />
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="w-4 h-4" />
                        <span>{t('userMenu.myProfile')}</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link to="/my-bookings" className="flex items-center gap-2 cursor-pointer">
                        <Calendar className="w-4 h-4" />
                        <span>{t('nav.myBookings')}</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link to="/history" className="flex items-center gap-2 cursor-pointer">
                        <History className="w-4 h-4" />
                        <span>{t('nav.history')}</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link to="/host/dashboard" className="flex items-center gap-2 cursor-pointer font-medium">
                        <User className="w-4 h-4" />
                        <span>{t('nav.switchToHosting')}</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={onDisconnect}
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                >
                    <LogOut className="w-4 h-4" />
                    <span>{t('userMenu.disconnectWallet')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
