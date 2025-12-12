import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Wallet, Moon, Sun, Menu, X, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { UserMenu } from "./UserMenu";
import { getContractOwner } from "@/lib/dispute";

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { theme, setTheme } = useTheme();
  const { userData, connectWallet, disconnectWallet } = useAuth();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!userData) {
        setIsOwner(false);
        return;
      }

      try {
        const owner = await getContractOwner();
        // In testnet, we compare with testnet address
        const userAddress = userData.profile.stxAddress.testnet;

        if (owner === userAddress) {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }
      } catch (error) {
        console.error("Error checking owner:", error);
        setIsOwner(false);
      }
    };

    checkAccess();
  }, [userData]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-primary-glow rounded-xl rotate-3 group-hover:rotate-6 transition-transform duration-300 opacity-20"></div>
              <div className="absolute inset-0 bg-gradient-to-bl from-primary to-primary-glow rounded-xl -rotate-3 group-hover:-rotate-6 transition-transform duration-300 opacity-20"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white">
                  <path d="M3 9.5L12 4L21 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M19 13V19.4C19 19.7314 18.7314 20 18.4 20H5.6C5.26863 20 5 19.7314 5 19.4V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 20V14H15V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" />
                </svg>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="font-heading text-2xl font-bold tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                StackNstay
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                {t('footer.tagline')}
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-primary after:transition-smooth"
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/properties"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-primary after:transition-smooth"
            >
              {t('nav.properties')}
            </Link>

            {/* Authenticated-only nav items */}
            {userData && (
              <>
                <Link
                  to="/my-bookings"
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-primary after:transition-smooth"
                >
                  {t('nav.myBookings')}
                </Link>
              </>
            )}

            {/* Admin Link */}
            {isOwner && (
              <Link
                to="/admin/disputes"
                className="text-sm font-medium text-red-500 hover:text-red-600 transition-smooth flex items-center gap-1"
              >
                <ShieldAlert className="w-4 h-4" />
                Disputes
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen((s) => !s)}
              className="md:hidden h-8 w-8 text-muted-foreground hover:bg-muted"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            {userData && (
              <Link to="/host/dashboard">
                <Button
                  variant="ghost"
                  className="hidden md:flex text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50"
                >
                  {t('nav.switchToHosting')}
                </Button>
              </Link>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full transition-smooth hover:bg-muted"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Wallet Connect / User Menu */}
            {userData ? (
              <UserMenu
                address={userData.profile.stxAddress.testnet
                }
                onDisconnect={disconnectWallet}
              />
            ) : (
              <Button
                onClick={connectWallet}
                className="gradient-hero text-primary-foreground shadow-elegant  transition-smooth font-semibold"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {t('nav.connectWallet')}
              </Button>
            )}
          </div>
        </div>
      </div>
      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-20 z-50 bg-background/95 border-t border-border shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-foreground/90"
              >
                {t('nav.home')}
              </Link>

              <Link
                to="/properties"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-foreground/90"
              >
                {t('nav.properties')}
              </Link>

              {userData && (
                <>
                  <Link to="/my-bookings" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground/90">
                    {t('nav.myBookings')}
                  </Link>
                </>
              )}

              {isOwner && (
                <Link
                  to="/admin/disputes"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-red-500 flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Disputes
                </Link>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="rounded-full"
                >
                  <Sun className="h-5 w-5" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>

                {userData ? (
                  <UserMenu address={userData.profile.stxAddress.testnet} onDisconnect={disconnectWallet} />
                ) : (
                  <Button onClick={() => { connectWallet(); setMobileOpen(false); }} className="gradient-hero text-primary-foreground shadow-elegant font-semibold">
                    <Wallet className="w-4 h-4 mr-2" />
                    {t('nav.connectWallet')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
