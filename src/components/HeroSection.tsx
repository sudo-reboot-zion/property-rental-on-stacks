import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Home, Wallet, Shield, Globe, Key, Search } from "lucide-react";

const HeroSection = () => {
    const { t } = useTranslation();
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-20">
            {/* Grid Background */}
            <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,hsl(var(--muted))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted))_1px,transparent_1px)] bg-[size:24px_24px] opacity-30"></div>

            {/* Radial Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10 pointer-events-none"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left Column: Content */}
                    <div className="text-left space-y-8 max-w-2xl">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-muted/50 border border-border px-4 py-2 rounded-full backdrop-blur-sm animate-fade-in hover:bg-muted transition-colors cursor-default">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium text-foreground">{t('hero.badge')}</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-foreground animate-slide-up">
                            {t('hero.title')} <br />
                            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                                {t('hero.titleHighlight')}
                            </span>
                        </h1>

                        {/* Subheading */}
                        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-lg animate-slide-up" style={{ animationDelay: "0.1s" }}>
                            {t('hero.subtitle')}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                            <Link to="/properties" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/20 border-0 h-14 px-8 rounded-xl text-lg font-semibold transition-all hover:scale-105">
                                    {t('hero.exploreButton')}
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Link to="/learn-more" className="w-full sm:w-auto">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-xl text-lg font-semibold backdrop-blur-sm transition-all">
                                    {t('hero.learnButton')}
                                </Button>
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border animate-fade-in" style={{ animationDelay: "0.3s" }}>
                            <div>
                                <div className="text-3xl font-bold text-foreground mb-1">1.2k+</div>
                                <div className="text-sm text-muted-foreground">{t('hero.stats.properties')}</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-foreground mb-1">50+</div>
                                <div className="text-sm text-muted-foreground">{t('hero.stats.countries')}</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-foreground mb-1">98%</div>
                                <div className="text-sm text-muted-foreground">{t('hero.stats.satisfaction')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Visual Diagram */}
                    <div className="relative hidden lg:block h-[600px] w-full animate-fade-in" style={{ animationDelay: "0.4s" }}>
                        {/* Central Hub */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                            <div className="relative w-32 h-32 bg-card border border-border rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/10 z-20">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-3xl blur-xl"></div>
                                <Home className="w-16 h-16 text-foreground relative z-10" />
                            </div>
                            {/* Pulsing Rings */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-border/30 rounded-full animate-ping opacity-20"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-border/30 rounded-full animate-pulse opacity-10"></div>
                        </div>

                        {/* Connecting Lines (SVG) */}
                        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                            {/* Lines connecting center to nodes */}
                            <path d="M300 300 L150 150" className="stroke-border stroke-2 opacity-50" strokeDasharray="4 4" />
                            <path d="M300 300 L450 150" className="stroke-border stroke-2 opacity-50" strokeDasharray="4 4" />
                            <path d="M300 300 L150 450" className="stroke-border stroke-2 opacity-50" strokeDasharray="4 4" />
                            <path d="M300 300 L450 450" className="stroke-border stroke-2 opacity-50" strokeDasharray="4 4" />
                        </svg>

                        {/* Node 1: Wallet */}
                        <div className="absolute top-[20%] left-[20%] animate-float" style={{ animationDelay: "0s" }}>
                            <div className="bg-card p-4 rounded-2xl border border-border shadow-xl flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                    <Wallet className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <div className="text-foreground font-semibold text-sm">{t('hero.node1Title')}</div>
                                    <div className="text-xs text-muted-foreground">{t('hero.node1Subtitle')}</div>
                                </div>
                            </div>
                        </div>

                        {/* Node 2: Search */}
                        <div className="absolute top-[20%] right-[20%] animate-float" style={{ animationDelay: "1.5s" }}>
                            <div className="bg-card p-4 rounded-2xl border border-border shadow-xl flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                    <Search className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-foreground font-semibold text-sm">{t('hero.node2Title')}</div>
                                    <div className="text-xs text-muted-foreground">{t('hero.node2Subtitle')}</div>
                                </div>
                            </div>
                        </div>

                        {/* Node 3: Security */}
                        <div className="absolute bottom-[20%] left-[20%] animate-float" style={{ animationDelay: "1s" }}>
                            <div className="bg-card p-4 rounded-2xl border border-border shadow-xl flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <div className="text-foreground font-semibold text-sm">{t('hero.node3Title')}</div>
                                    <div className="text-xs text-muted-foreground">{t('hero.node3Subtitle')}</div>
                                </div>
                            </div>
                        </div>

                        {/* Node 4: Global */}
                        <div className="absolute bottom-[20%] right-[20%] animate-float" style={{ animationDelay: "2.5s" }}>
                            <div className="bg-card p-4 rounded-2xl border border-border shadow-xl flex items-center gap-3">
                                <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-pink-400" />
                                </div>
                                <div>
                                    <div className="text-foreground font-semibold text-sm">{t('hero.node4Title')}</div>
                                    <div className="text-xs text-muted-foreground">{t('hero.node4Subtitle')}</div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Particles */}
                        <div className="absolute top-1/4 left-1/2 w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
                        <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
