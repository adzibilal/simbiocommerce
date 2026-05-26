"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { useCallback, useRef, useEffect, useState } from "react";
import Image from "next/image";

import "swiper/css/navigation";
import "swiper/css";

interface Testimonial {
  id: string;
  review: string;
  authorName: string;
  authorRole: string;
  authorImg: string;
  rating: number;
}

const SingleItem = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <div className="shadow-testimonial bg-white rounded-[10px] py-7.5 px-4 sm:px-8.5 m-1">
      <div className="flex items-center gap-1 mb-5">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Image
            key={i}
            src="/images/icons/icon-star.svg"
            alt="star icon"
            width={15}
            height={15}
          />
        ))}
      </div>

      <p className="text-dark mb-6">{testimonial.review}</p>

      <div className="flex items-center gap-4">
        <div className="w-12.5 h-12.5 rounded-full overflow-hidden bg-blue/10 flex items-center justify-center shrink-0">
          {testimonial.authorImg && !testimonial.authorImg.startsWith("/images/users") ? (
            <img src={testimonial.authorImg} alt={testimonial.authorName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-blue font-semibold text-lg">
              {testimonial.authorName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div>
          <h3 className="font-medium text-dark">{testimonial.authorName}</h3>
          <p className="text-custom-sm">{testimonial.authorRole}</p>
        </div>
      </div>
    </div>
  );
};

const Testimonials = ({ data }: { data: Testimonial[] }) => {
  const sliderRef = useRef(null);

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;
    (sliderRef.current as any).swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    (sliderRef.current as any).swiper.slideNext();
  }, []);

  if (data.length === 0) return null;

  return (
    <section className="overflow-hidden pb-16.5">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="">
          <div className="swiper testimonial-carousel common-carousel p-5">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
                  <svg className="text-blue" width="17" height="17" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M7.49984 1.04175C5.31371 1.04175 3.5415 2.81395 3.5415 5.00008C3.5415 7.18621 5.31371 8.95842 7.49984 8.95842C9.68596 8.95842 11.4582 7.18621 11.4582 5.00008C11.4582 2.81395 9.68596 1.04175 7.49984 1.04175ZM4.7915 5.00008C4.7915 3.50431 6.00407 2.29175 7.49984 2.29175C8.99561 2.29175 10.2082 3.50431 10.2082 5.00008C10.2082 6.49585 8.99561 7.70842 7.49984 7.70842C6.00407 7.70842 4.7915 6.49585 4.7915 5.00008Z" fill="currentColor"/>
                    <path d="M12.4998 1.87508C12.1547 1.87508 11.8748 2.1549 11.8748 2.50008C11.8748 2.84526 12.1547 3.12508 12.4998 3.12508C13.5354 3.12508 14.3748 3.96455 14.3748 5.00008C14.3748 6.03562 13.5354 6.87508 12.4998 6.87508C12.1547 6.87508 11.8748 7.1549 11.8748 7.50008C11.8748 7.84526 12.1547 8.12508 12.4998 8.12508C14.2257 8.12508 15.6248 6.72597 15.6248 5.00008C15.6248 3.27419 14.2257 1.87508 12.4998 1.87508Z" fill="currentColor"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M3.06496 11.2671C4.2311 10.6007 5.80039 10.2084 7.49984 10.2084C9.19928 10.2084 10.7686 10.6007 11.9347 11.2671C13.0832 11.9233 13.9582 12.9252 13.9582 14.1667C13.9582 15.4083 13.0832 16.4102 11.9347 17.0664C10.7686 17.7328 9.19928 18.1251 7.49984 18.1251C5.80039 18.1251 4.2311 17.7328 3.06496 17.0664C1.9165 16.4102 1.0415 15.4083 1.0415 14.1667C1.0415 12.9252 1.9165 11.9233 3.06496 11.2671ZM3.68513 12.3524C2.72234 12.9025 2.2915 13.5674 2.2915 14.1667C2.2915 14.7661 2.72234 15.431 3.68513 15.9811C4.63025 16.5212 5.97762 16.8751 7.49984 16.8751C9.02205 16.8751 10.3694 16.5212 11.3145 15.9811C12.2773 15.431 12.7082 14.7661 12.7082 14.1667C12.7082 13.5674 12.2773 12.9025 11.3145 12.3524C10.3694 11.8123 9.02205 11.4584 7.49984 11.4584C5.97762 11.4584 4.63025 11.8123 3.68513 12.3524Z" fill="currentColor"/>
                    <path d="M15.1337 11.0563C14.7965 10.9823 14.4633 11.1957 14.3893 11.5329C14.3154 11.87 14.5288 12.2033 14.866 12.2772C15.5263 12.422 16.054 12.6708 16.4022 12.9557C16.751 13.2411 16.8748 13.5198 16.8748 13.7501C16.8748 13.959 16.7743 14.2043 16.4973 14.4617C16.2182 14.7209 15.7894 14.9604 15.2363 15.127C14.9058 15.2265 14.7185 15.5751 14.818 15.9056C14.9176 16.2362 15.2662 16.4234 15.5967 16.3239C16.2822 16.1175 16.8951 15.7982 17.348 15.3775C17.803 14.9549 18.1248 14.3989 18.1248 13.7501C18.1248 13.0294 17.7296 12.4268 17.1938 11.9884C16.6576 11.5495 15.9353 11.232 15.1337 11.0563Z" fill="currentColor"/>
                  </svg>
                  Testimonials
                </span>
                <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
                  User Feedbacks
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div onClick={handlePrev} className="swiper-button-prev">
                  <svg
                    className="fill-current"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M15.4881 4.43057C15.8026 4.70014 15.839 5.17361 15.5694 5.48811L9.98781 12L15.5694 18.5119C15.839 18.8264 15.8026 19.2999 15.4881 19.5695C15.1736 19.839 14.7001 19.8026 14.4306 19.4881L8.43056 12.4881C8.18981 12.2072 8.18981 11.7928 8.43056 11.5119L14.4306 4.51192C14.7001 4.19743 15.1736 4.161 15.4881 4.43057Z"
                      fill=""
                    />
                  </svg>
                </div>

                <div onClick={handleNext} className="swiper-button-next">
                  <svg
                    className="fill-current"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.51192 4.43057C8.82641 4.161 9.29989 4.19743 9.56946 4.51192L15.5695 11.5119C15.8102 11.7928 15.8102 12.2072 15.5695 12.4881L9.56946 19.4881C9.29989 19.8026 8.82641 19.839 8.51192 19.5695C8.19743 19.2999 8.161 18.8264 8.43057 18.5119L14.0122 12L8.43057 5.48811C8.161 5.17361 8.19743 4.70014 8.51192 4.43057Z"
                      fill=""
                    />
                  </svg>
                </div>
              </div>
            </div>

            <Swiper
              ref={sliderRef}
              slidesPerView={3}
              spaceBetween={20}
              breakpoints={{
                0: {
                  slidesPerView: 1,
                },
                1000: {
                  slidesPerView: 2,
                },
                1200: {
                  slidesPerView: 3,
                },
              }}
            >
              {data.map((item) => (
                <SwiperSlide key={item.id}>
                  <SingleItem testimonial={item} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
