import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getActivePromoBanners } from "@/app/actions/promo-banner";

const BUTTON_COLOR_MAP: Record<string, string> = {
  blue: "bg-blue hover:bg-blue-dark",
  teal: "bg-teal hover:bg-teal-dark",
  orange: "bg-orange hover:bg-orange-dark",
};

const PromoBanner = async () => {
  const banners = await getActivePromoBanners();

  if (banners.length === 0) return null;

  const bigBanners = banners.filter((b) => b.layout === "big");
  const smallLeftBanners = banners.filter((b) => b.layout === "small_left");
  const smallRightBanners = banners.filter((b) => b.layout === "small_right");

  const big = bigBanners[0];
  const smallLeft = smallLeftBanners[0];
  const smallRight = smallRightBanners[0];

  const LinkWrapper = ({
    href,
    newTab,
    children,
    className,
  }: {
    href: string;
    newTab: boolean;
    children: React.ReactNode;
    className: string;
  }) => (
    <Link
      href={href}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      className={className}
    >
      {children}
    </Link>
  );

  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {big && (
          <div
            className="relative z-1 overflow-hidden rounded-lg py-12.5 lg:py-17.5 xl:py-22.5 px-4 sm:px-7.5 lg:px-14 xl:px-19 mb-7.5"
            style={{ backgroundColor: big.bgColor }}
          >
            <div className="max-w-[550px] w-full">
              <span className="block font-medium text-xl text-dark mb-3">
                {big.title}
              </span>
              <h2 className="font-bold text-xl lg:text-heading-4 xl:text-heading-3 text-dark mb-5">
                {big.subtitle}
              </h2>
              {big.description && <p>{big.description}</p>}
              <LinkWrapper
                href={big.buttonLink}
                newTab={big.isNewTab ?? false}
                className={`inline-flex font-medium text-custom-sm text-white ${BUTTON_COLOR_MAP[big.buttonColor] || BUTTON_COLOR_MAP.blue} py-[11px] px-9.5 rounded-md ease-out duration-200 mt-7.5`}
              >
                {big.buttonText}
              </LinkWrapper>
            </div>
            {big.imageUrl && (
              <Image
                src={big.imageUrl}
                alt="promo img"
                className="absolute bottom-0 right-4 lg:right-26 -z-1 object-contain"
                width={274}
                height={350}
                unoptimized
              />
            )}
          </div>
        )}

        {(smallLeft || smallRight) && (
          <div className="grid gap-7.5 grid-cols-1 lg:grid-cols-2">
            {smallLeft && (
              <div
                className="relative z-1 overflow-hidden rounded-lg py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10"
                style={{ backgroundColor: smallLeft.bgColor }}
              >
                {smallLeft.imageUrl && (
                  <Image
                    src={smallLeft.imageUrl}
                    alt="promo img"
                    className="absolute top-1/2 -translate-y-1/2 left-3 sm:left-10 -z-1 object-contain"
                    width={241}
                    height={241}
                    unoptimized
                  />
                )}
                <div className="text-right">
                  <span className="block text-lg text-dark mb-1.5">
                    {smallLeft.title}
                  </span>
                  <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                    {smallLeft.subtitle}
                  </h2>
                  {smallLeft.description && (
                    <p className="font-semibold text-custom-1 text-teal">
                      {smallLeft.description}
                    </p>
                  )}
                  <LinkWrapper
                    href={smallLeft.buttonLink}
                    newTab={smallLeft.isNewTab ?? false}
                    className={`inline-flex font-medium text-custom-sm text-white ${BUTTON_COLOR_MAP[smallLeft.buttonColor] || BUTTON_COLOR_MAP.teal} py-2.5 px-8.5 rounded-md ease-out duration-200 mt-9`}
                  >
                    {smallLeft.buttonText}
                  </LinkWrapper>
                </div>
              </div>
            )}

            {smallRight && (
              <div
                className="relative z-1 overflow-hidden rounded-lg py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10"
                style={{ backgroundColor: smallRight.bgColor }}
              >
                {smallRight.imageUrl && (
                  <Image
                    src={smallRight.imageUrl}
                    alt="promo img"
                    className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-8.5 -z-1 object-contain"
                    width={200}
                    height={200}
                    unoptimized
                  />
                )}
                <div>
                  <span className="block text-lg text-dark mb-1.5">
                    {smallRight.title}
                  </span>
                  <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                    {smallRight.subtitle}
                  </h2>
                  {smallRight.description && (
                    <p className="max-w-[285px] text-custom-sm">
                      {smallRight.description}
                    </p>
                  )}
                  <LinkWrapper
                    href={smallRight.buttonLink}
                    newTab={smallRight.isNewTab ?? false}
                    className={`inline-flex font-medium text-custom-sm text-white ${BUTTON_COLOR_MAP[smallRight.buttonColor] || BUTTON_COLOR_MAP.orange} py-2.5 px-8.5 rounded-md ease-out duration-200 mt-7.5`}
                  >
                    {smallRight.buttonText}
                  </LinkWrapper>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default PromoBanner;
