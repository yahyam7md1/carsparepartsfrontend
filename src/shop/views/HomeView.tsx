import { BrandGrid } from "@/shop/components/home/BrandGrid";
import { BrowseByCategorySection } from "@/shop/components/home/BrowseByCategorySection";
import { Hero } from "@/shop/components/home/hero/Hero";
import { HomeFeaturedSection } from "@/shop/components/home/HomeFeaturedSection";
import { StatsStrip } from "@/shop/components/home/StatsStrip";
import { SupportBanner } from "@/shop/components/home/SupportBanner";

export async function HomeView() {
  return (
    <div className="pb-16">
      <Hero />
      <div className="mx-auto max-w-7xl space-y-16 px-4 py-16">
        <BrandGrid />
        <BrowseByCategorySection />
        <HomeFeaturedSection />
        <SupportBanner />
        <StatsStrip />
      </div>
    </div>
  );
}
