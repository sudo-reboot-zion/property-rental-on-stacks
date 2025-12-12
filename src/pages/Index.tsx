import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader";
import { Shield, Zap, Globe } from "lucide-react";
import { VideoRotation } from "@/components/VideoRotation";
import BaseContext from "@/components/BaseContent";
import KindWords from "@/components/KindWords";
import HowItWorks from "@/components/HowItWorks";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import AIChatButton from "@/components/AIChatButton";
import ScrollToTop from "@/components/ScrollToTop";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <HeroSection />


      <VideoRotation />


      {/* Features Section */}
      <FeaturesSection />


      {/* Basecontent */}
      <BaseContext />

      {/* How It Works */}
      <HowItWorks />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">{t('pages.index.ctaTitle')}</h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              {t('pages.index.ctaSubtitle')}
            </p>
            <Link to="/properties">
              <Button size="lg" className="gradient-hero text-primary-foreground shadow-elegant hover:shadow-glow transition-smooth font-semibold text-lg px-12 h-14 rounded-xl">
                {t('pages.index.ctaButton')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <KindWords />

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default Index;
