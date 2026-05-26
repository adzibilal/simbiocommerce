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
import { getReviews } from "@/app/actions/review";
import { db } from "@/db";
import { reviews, users, products } from "@/db/schema";
import { eq } from "drizzle-orm";

const Home = async () => {
  const countdownData = await getActiveCountdown();

  const rawReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      customerName: users.name,
      customerImage: users.image,
      productName: products.name,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.customerId, users.id))
    .leftJoin(products, eq(reviews.productId, products.id))
    .where(eq(reviews.status, "approved"));

  const testimonials = rawReviews.map((r) => ({
    id: r.id,
    review: r.comment ?? "",
    authorName: r.customerName ?? "Customer",
    authorRole: r.productName ?? "Verified Buyer",
    authorImg: r.customerImage ?? "/images/users/user-01.png",
    rating: r.rating,
  }));

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
