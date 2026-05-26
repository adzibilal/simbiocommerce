"use client";
import React, { useState } from "react";
import { validateCoupon } from "@/app/actions/coupon";

interface CouponProps {
  subtotal: number;
  onApply: (discount: number, code: string) => void;
  appliedCode: string;
}

const Coupon = ({ subtotal, onApply, appliedCode }: CouponProps) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    const result = await validateCoupon(code.trim());
    if (!result.success || !result.coupon) {
      setError(result.error || "Invalid coupon");
      setLoading(false);
      return;
    }
    const c = result.coupon;
    let discount = 0;
    if (c.type === "percentage") {
      discount = Math.round(subtotal * (parseFloat(c.discount) / 100));
    } else {
      discount = parseInt(c.discount);
    }
    onApply(discount, c.code);
    setLoading(false);
  };

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Have a Coupon?</h3>
      </div>
      <div className="py-6 px-4 sm:px-8.5">
        {appliedCode ? (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-4 py-3">
            <div>
              <p className="text-sm font-medium text-green-700">Coupon <span className="font-bold">{appliedCode}</span> applied!</p>
            </div>
            <button
              type="button"
              onClick={() => { onApply(0, ""); setCode(""); }}
              className="text-xs text-red hover:underline ml-3"
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-3">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApply())}
                placeholder="Enter coupon code"
                className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              />
              <button
                type="button"
                onClick={handleApply}
                disabled={loading}
                className="shrink-0 inline-flex font-medium text-white bg-blue py-2.5 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-60"
              >
                {loading ? "..." : "Apply"}
              </button>
            </div>
            {error && <p className="text-xs text-red mt-2">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default Coupon;
