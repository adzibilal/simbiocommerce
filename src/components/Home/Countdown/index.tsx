"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface CountdownData {
  id: string;
  label: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  buttonText: string;
  buttonLink: string;
  endDate: string;
  bgColor: string;
  buttonColor: string;
  isNewTab: boolean | null;
}

const BUTTON_COLOR_MAP: Record<string, string> = {
  blue: "bg-blue hover:bg-blue-dark",
  teal: "bg-teal hover:bg-teal-dark",
  orange: "bg-orange hover:bg-orange-dark",
};

const CounDown = ({ data }: { data: CountdownData | null }) => {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!data) return;

    const getTime = () => {
      const time = Date.parse(data.endDate) - Date.now();
      if (time <= 0) {
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        return;
      }
      setDays(Math.floor(time / (1000 * 60 * 60 * 24)));
      setHours(Math.floor((time / (1000 * 60 * 60)) % 24));
      setMinutes(Math.floor((time / 1000 / 60) % 60));
      setSeconds(Math.floor((time / 1000) % 60));
    };

    getTime();
    const interval = setInterval(getTime, 1000);
    return () => clearInterval(interval);
  }, [data]);

  if (!data) return null;

  const btnClass = BUTTON_COLOR_MAP[data.buttonColor] || BUTTON_COLOR_MAP.blue;

  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div
          className="relative overflow-hidden z-1 rounded-lg p-4 sm:p-7.5 lg:p-10 xl:p-15"
          style={{ backgroundColor: 'rgb(var(--primary-rgb) / 0.15)' }}
        >
          <div className="max-w-[422px] w-full">
            <span className="block font-medium text-custom-1 text-blue mb-2.5">
              {data.label}
            </span>

            <h2 className="font-bold text-dark text-xl lg:text-heading-4 xl:text-heading-3 mb-3">
              {data.title}
            </h2>

            {data.description && <p>{data.description}</p>}

            <div className="flex flex-wrap gap-6 mt-6">
              <div>
                <span className="min-w-[64px] h-14.5 font-semibold text-xl lg:text-3xl text-dark rounded-lg flex items-center justify-center bg-white shadow-2 px-4 mb-2">
                  {days < 10 ? "0" + days : days}
                </span>
                <span className="block text-custom-sm text-dark text-center">Days</span>
              </div>
              <div>
                <span className="min-w-[64px] h-14.5 font-semibold text-xl lg:text-3xl text-dark rounded-lg flex items-center justify-center bg-white shadow-2 px-4 mb-2">
                  {hours < 10 ? "0" + hours : hours}
                </span>
                <span className="block text-custom-sm text-dark text-center">Hours</span>
              </div>
              <div>
                <span className="min-w-[64px] h-14.5 font-semibold text-xl lg:text-3xl text-dark rounded-lg flex items-center justify-center bg-white shadow-2 px-4 mb-2">
                  {minutes < 10 ? "0" + minutes : minutes}
                </span>
                <span className="block text-custom-sm text-dark text-center">Minutes</span>
              </div>
              <div>
                <span className="min-w-[64px] h-14.5 font-semibold text-xl lg:text-3xl text-dark rounded-lg flex items-center justify-center bg-white shadow-2 px-4 mb-2">
                  {seconds < 10 ? "0" + seconds : seconds}
                </span>
                <span className="block text-custom-sm text-dark text-center">Seconds</span>
              </div>
            </div>

            <Link
              href={data.buttonLink}
              target={data.isNewTab ? "_blank" : undefined}
              rel={data.isNewTab ? "noopener noreferrer" : undefined}
              className={`inline-flex font-medium text-custom-sm text-white ${btnClass} py-3 px-9.5 rounded-md ease-out duration-200 mt-7.5`}
            >
              {data.buttonText}
            </Link>
          </div>

          <Image
            src="/images/countdown/countdown-bg.png"
            alt="bg shapes"
            className="hidden sm:block absolute right-0 bottom-0 -z-1"
            width={737}
            height={482}
          />
          {data.imageUrl && (
            <Image
              src={data.imageUrl}
              alt="product"
              className="hidden lg:block absolute right-4 xl:right-33 bottom-4 xl:bottom-10 -z-1 object-contain"
              width={411}
              height={376}
              unoptimized
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default CounDown;
