import React from "react";
import Image from "next/image";
import { getActiveHeroFeatures } from "@/app/actions/hero-feature";

const HeroFeature = async () => {
  const features = await getActiveHeroFeatures();

  if (features.length === 0) return null;

  return (
    <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-7.5 mt-10">
        {features.map((item) => (
          <div className="flex items-center gap-4" key={item.id}>
            <Image src={item.imageUrl} alt="icons" width={40} height={41} />

            <div>
              <h3 className="font-medium text-lg text-dark">{item.title}</h3>
              <p className="text-sm">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroFeature;
