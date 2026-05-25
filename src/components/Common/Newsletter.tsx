"use client";
import React, { useState } from "react";
import { subscribeNewsletter } from "@/app/actions/newsletter";
import { toast } from "react-hot-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    toast.loading("Subscribing...", { id: "newsletter" });

    try {
      const result = await subscribeNewsletter(email.trim());
      if (result.success) {
        toast.success("Successfully subscribed!", { id: "newsletter" });
        setEmail("");
      } else {
        toast.error(result.error || "Failed to subscribe", { id: "newsletter" });
      }
    } catch {
      toast.error("Something went wrong", { id: "newsletter" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="overflow-hidden">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative z-1 overflow-hidden rounded-xl bg-blue">
          <div className="absolute -z-1 inset-0 bg-gradient-to-r from-blue-dark/60 to-transparent pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 px-4 sm:px-7.5 xl:pl-12.5 xl:pr-14 py-11">
            <div className="max-w-[491px] w-full">
              <h2 className="max-w-[399px] text-white font-bold text-lg sm:text-xl xl:text-heading-4 mb-3">
                Don&apos;t Miss Out Latest Trends & Offers
              </h2>
              <p className="text-white">
                Register to receive news about the latest offers & discount codes
              </p>
            </div>

            <div className="max-w-[477px] w-full">
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-gray-1 border border-gray-3 outline-none rounded-md placeholder:text-dark-4 py-3 px-5"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center py-3 px-7 text-blue bg-white font-medium rounded-md ease-out duration-200 hover:bg-gray-1 disabled:opacity-50 whitespace-nowrap"
                  >
                    {isSubmitting ? "Subscribing..." : "Subscribe"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
