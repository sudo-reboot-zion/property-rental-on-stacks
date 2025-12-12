import { Shield, Zap, Globe, ArrowRight, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const FeaturesSection = () => {
    const { t } = useTranslation();
    
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 animate-fade-in">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">{t('features.badge')}</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 font-heading">
                        {t('features.title')} <span className="text-primary">{t('features.titleHighlight')}</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        {t('features.subtitle')}
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16 max-w-7xl mx-auto">

                    {/* Feature 1: Instant Setup */}
                    <div className="group">
                        {/* Card */}
                        <div className="bg-muted/30 rounded-[2rem] aspect-square relative mb-8 flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
                            {/* Badge */}
                            <div className="absolute top-6 left-6 bg-foreground text-background text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider z-10">
                                {t('features.instant.badge')}
                            </div>

                            {/* Icon */}
                            <div className="relative z-0 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                                <Zap className="w-32 h-32 text-emerald-400 fill-emerald-400/20" strokeWidth={1.5} />
                                {/* Decorative blob behind */}
                                <div className="absolute inset-0 bg-emerald-400/20 blur-3xl rounded-full -z-10 scale-150"></div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold font-heading">{t('features.instant.title')}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {t('features.instant.description')}
                            </p>
                        </div>
                    </div>

                    {/* Feature 2: Lower Fees */}
                    <div className="group">
                        {/* Card */}
                        <div className="bg-muted/30 rounded-[2rem] aspect-square relative mb-8 flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
                            {/* Badge */}
                            <div className="absolute bottom-6 left-6 bg-foreground text-background text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider z-10">
                                {t('features.fees.badge')}
                            </div>

                            {/* Icon */}
                            <div className="relative z-0 transform transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                                <ArrowRight className="w-32 h-32 text-purple-400 rotate-45" strokeWidth={2.5} />
                                {/* Decorative blob behind */}
                                <div className="absolute inset-0 bg-purple-400/20 blur-3xl rounded-full -z-10 scale-150"></div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold font-heading">{t('features.fees.title')}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {t('features.fees.description')}
                            </p>
                        </div>
                    </div>

                    {/* Feature 3: Global Access */}
                    <div className="group">
                        {/* Card */}
                        <div className="bg-muted/30 rounded-[2rem] aspect-square relative mb-8 flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
                            {/* Badge */}
                            <div className="absolute top-6 right-6 bg-foreground text-background text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider z-10">
                                {t('features.global.badge')}
                            </div>

                            {/* Icon */}
                            <div className="relative z-0 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                                <Globe className="w-32 h-32 text-amber-400" strokeWidth={1.5} />
                                {/* Decorative blob behind */}
                                <div className="absolute inset-0 bg-amber-400/20 blur-3xl rounded-full -z-10 scale-150"></div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold font-heading">{t('features.global.title')}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {t('features.global.description')}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
