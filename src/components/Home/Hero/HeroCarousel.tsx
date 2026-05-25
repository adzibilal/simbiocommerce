"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";

// Import Swiper styles
import "swiper/css/pagination";
import "swiper/css";

interface HeroSlide {
  id: string;
  imageUrl: string;
  link: string;
  isNewTab: boolean | null;
  order: number;
  isActive: boolean;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
}

const HeroCarousel = ({ slides }: HeroCarouselProps) => {
  if (!slides || slides.length === 0) {
    return (
      <div className="relative w-full aspect-[21/9] bg-gray-2 rounded-[10px] flex items-center justify-center">
        <p className="text-dark-4">No slides available</p>
      </div>
    );
  }

  return (
    <Swiper
      spaceBetween={0}
      centeredSlides={true}
      autoplay={{
        delay: 5000,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
        bulletClass: "swiper-pagination-bullet custom-bullet",
        bulletActiveClass: "swiper-pagination-bullet-active custom-bullet-active",
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel w-full rounded-[10px] overflow-hidden"
      style={{ aspectRatio: "21/9" }}
    >
      {slides.map((slide) => (
        <SwiperSlide key={slide.id}>
          <Link
            href={slide.link}
            target={slide.isNewTab ? "_blank" : undefined}
            rel={slide.isNewTab ? "noopener noreferrer" : undefined}
            className="relative block w-full h-full"
            style={{ aspectRatio: "21/9" }}
          >
            <Image
              src={slide.imageUrl}
              alt="Hero slide"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroCarousel;
