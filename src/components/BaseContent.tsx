import React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

function BaseContext() {
  const { t } = useTranslation();
  return (
    <section className="relative py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-foreground leading-tight">
                {t('baseContent.title')} <br />
                <span className="text-muted-foreground">{t('baseContent.titleHighlight')}</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                {t('baseContent.subtitle')}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">0%</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t('baseContent.fee1Title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('baseContent.fee1Description')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t('baseContent.fee2Title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('baseContent.fee2Description')}</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button size="lg" className="group px-8 rounded-full shadow-lg hover:shadow-primary/25 transition-all duration-300">
                {t('baseContent.startHosting')}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            {/* Main Image */}
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 aspect-[4/5] lg:aspect-square">
              <img
                src="/landa2.jpg"
                alt="Modern minimalist interior"
                className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

              {/* Floating Badge */}
              <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold text-lg">Verified Property</p>
                    <p className="text-white/80 text-sm">New York, USA</p>
                  </div>
                  <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                    4.98 ★
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-accent/20 rounded-full blur-3xl -z-10"></div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default BaseContext;
