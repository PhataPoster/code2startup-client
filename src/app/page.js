import HeroSlider from "@/components/hero-slider";
import FeatureStartups from "@/components/FeatureStartups";
import FeaturedOpportunities from "@/components/FeaturedOpportunities";
import WhyJoinSection from "@/components/WhyJoinSection";
import PlatformPulse from "@/components/PlatformPulse";

export default function Home() {
  return (
    <div>
      <HeroSlider />
      <FeatureStartups />
      <FeaturedOpportunities />
      <WhyJoinSection />
      <PlatformPulse />
    </div>
  );
}
