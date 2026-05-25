import React from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import NewArrival from "./NewArrivals";
import PromoBanner from "./PromoBanner";
import BestSeller from "./BestSeller";
import CounDown from "./Countdown";
import Testimonials from "./Testimonials";
import Newsletter from "../Common/Newsletter";
import { getActiveCountdown } from "@/app/actions/countdown";
import { getActiveTestimonials } from "@/app/actions/testimonial";

const Home = async () => {
  const countdownData = await getActiveCountdown();
  const testimonials = await getActiveTestimonials();

  return (
    <main>
      <Hero />
      <Categories />
      <NewArrival />
      <PromoBanner />
      <BestSeller />
      <CounDown data={countdownData} />
      <Testimonials data={testimonials} />
      <Newsletter />
    </main>
  );
};

export default Home;
