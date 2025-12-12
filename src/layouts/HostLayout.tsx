import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, PlusCircle, List, Settings, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { WalletAddress } from "@/components/WalletAddress";
import { useTranslation } from "react-i18next";

const HostLayout = () => {
    const location = useLocation();
    const { userData, disconnectWallet } = useAuth();
    const { t } = useTranslation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl hidden md:flex flex-col fixed h-full z-30">
                <div className="p-6 border-b border-border">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="relative w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center shadow-lg">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white">
                                <path d="M3 9.5L12 4L21 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M19 13V19.4C19 19.7314 18.7314 20 18.4 20H5.6C5.26863 20 5 19.7314 5 19.4V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="font-heading font-bold text-xl tracking-tight">Host Mode</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/host/dashboard">
                        <Button
                            variant={isActive("/host/dashboard") ? "secondary" : "ghost"}
                            className="w-full justify-start gap-3"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Overview
                        </Button>
                    </Link>
                    <Link to="/host/create-listing">
                        <Button
                            variant={isActive("/host/create-listing") ? "secondary" : "ghost"}
                            className="w-full justify-start gap-3"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Create Listing
                        </Button>
                    </Link>
                    <Link to="/host/listings">
                        <Button
                            variant={isActive("/host/listings") ? "secondary" : "ghost"}
                            className="w-full justify-start gap-3"
                        >
                            <List className="w-4 h-4" />
                            My Listings
                        </Button>
                    </Link>
                </nav>

                <div className="p-4 border-t border-border space-y-2">
                    <Link to="/">
                        <Button variant="outline" className="w-full justify-start gap-3">
                            <Home className="w-4 h-4" />
                            Switch to Traveling
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={disconnectWallet}
                    >
                        <LogOut className="w-4 h-4" />
                        Disconnect
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen">
                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default HostLayout;
