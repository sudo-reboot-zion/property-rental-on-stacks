import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Github, Twitter, Mail } from "lucide-react";

const Footer = () => {
    const { t, i18n } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

    // Listen for language changes from i18n
    useEffect(() => {
        const handleLanguageChanged = (lng: string) => {
            setCurrentLanguage(lng);
        };

        i18n.on('languageChanged', handleLanguageChanged);

        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, [i18n]);

    const languages = [
        { code: 'de', label: 'GER' },
        { code: 'es', label: 'SPA' },
        { code: 'sv', label: 'SWE' },
        { code: 'en', label: 'ENG' },
        { code: 'ru', label: 'RUS' },
    ];

    const changeLanguage = (lng: string) => {
        try {
            // Persist selection so language detector and reloads honour it
            localStorage.setItem('i18nextLng', lng);
        } catch (e) {
            // ignore if storage not available
        }

        // Change language - will trigger re-render via useEffect listener
        i18n.changeLanguage(lng).catch((err) => console.error('Language change error:', err));
    };

    return (
        <footer className="relative bg-gradient-to-b from-background to-muted/30 border-t border-border/50 pt-16 pb-8 overflow-hidden">
            {/* Subtle animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>

            {/* Decorative grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative w-12 h-12 flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary to-primary-glow rounded-xl rotate-3 transition-transform duration-300 opacity-20"></div>
                                <div className="absolute inset-0 bg-gradient-to-bl from-primary to-primary-glow rounded-xl -rotate-3 transition-transform duration-300 opacity-20"></div>
                                <div className="relative w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center shadow-lg transition-all duration-300">
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
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {t('footer.description')}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">{t('footer.platform')}</h3>
                        <ul className="space-y-3">
                            <li><a href="/properties" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('footer.browseProperties')}</a></li>
                            <li><a href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('footer.aboutUs')}</a></li>
                            <li><a href="/how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('footer.howItWorks')}</a></li>
                            <li><a href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('footer.faq')}</a></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">{t('footer.support')}</h3>
                        <ul className="space-y-3">
                            <li><a href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('footer.helpCenter')}</a></li>
                            <li><a href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('footer.contactUs')}</a></li>
                            <li><a href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('footer.privacy')}</a></li>
                            <li><a href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('footer.terms')}</a></li>
                        </ul>
                    </div>

                    {/* Social & Languages */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">{t('footer.connect')}</h3>
                        <div className="flex gap-3 mb-6">
                            <a href="https://twitter.com" className="w-10 h-10 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors group">
                                <Twitter className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </a>
                            <a href="https://github.com" className="w-10 h-10 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors group">
                                <Github className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </a>
                            <a href="mailto:hello@stacknstay.com" className="w-10 h-10 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors group">
                                <Mail className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </a>
                        </div>

                        {/* Language Selector */}
                        <div className="flex flex-wrap gap-2">
                            {languages.map((lang) => {
                                const active = (currentLanguage || '').startsWith(lang.code);
                                return (
                                    <button
                                        key={lang.code}
                                        onClick={() => changeLanguage(lang.code)}
                                        aria-pressed={active}
                                        aria-label={`Switch language to ${lang.label}`}
                                        className={`px-3 py-1 text-xs rounded-md transition-colors ${active
                                                ? 'bg-primary text-primary-foreground font-medium'
                                                : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                                            }`}
                                    >
                                        {lang.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border/50">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                            {t('footer.copyright')}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{t('footer.builtOn')}</span>
                            <span className="px-2 py-1 rounded bg-primary/10 text-primary font-medium">{t('footer.blockchain')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subtle bottom accent */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        </footer>
    );
};

export default Footer;
