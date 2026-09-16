import FloatingOrbs from "@/components/landing/FloatingOrbs";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import PlatformsSection from "@/components/landing/PlatformsSection";
import DashboardPreview from "@/components/landing/DashboardPreview";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="shortiq-root transition-colors duration-500">
      <FloatingOrbs />
      <Navbar />
      <main className="relative z-10 bg-background shadow-2xl rounded-b-3xl">
        <HeroSection />
        <PlatformsSection />
        <DashboardPreview />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
