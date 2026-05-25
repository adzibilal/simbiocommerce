import React from "react";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";
import { getActiveHeroSlides } from "@/app/actions/hero-slide";

const Hero = async () => {
  const slides = await getActiveHeroSlides();

  return (
    <section className="overflow-hidden pb-10 lg:pb-12.5 xl:pb-15 pt-57.5 sm:pt-45 lg:pt-30 xl:pt-51.5 bg-[#E5EAF4]">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="rounded-[10px] overflow-hidden">
          <HeroCarousel slides={slides} />
        </div>
      </div>

      {/* <!-- Hero features --> */}
      <HeroFeature />
    </section>
  );
};

export default Hero;
