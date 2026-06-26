import { LandingHero } from "@/components/landing/LandingHero";
import { SocialProofStrip } from "@/components/landing/SocialProofStrip";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingTestimonials } from "@/components/landing/LandingTestimonials";
import { LandingPricing } from "@/components/landing/LandingPricing";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { LandingCTA } from "@/components/landing/LandingCTA";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const Index = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (session) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <LandingHero />
      <SocialProofStrip />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingTestimonials />
      <LandingPricing />
      <LandingFAQ />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
};

export default Index;
