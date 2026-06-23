import HeroSlider from "@/components/hero-slider";
import FeatureStartups from "@/components/FeatureStartups";
import FeaturedOpportunities from "@/components/FeaturedOpportunities";
import WhyJoinSection from "@/components/WhyJoinSection";

export default function Home() {
  return (
    <div>
      <HeroSlider />
      <FeatureStartups />
      <FeaturedOpportunities />
      <WhyJoinSection />
    </div>
  );
}
