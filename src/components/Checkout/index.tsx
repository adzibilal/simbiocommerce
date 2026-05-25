"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import Shipping from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import Billing from "./Billing";
import { useAppSelector } from "@/redux/store";
import { formatCurrency } from "@/lib/currency";
import { selectCartItems, selectTotalPrice, selectTotalWeight } from "@/redux/features/cart-slice";
import { createOrder } from "@/app/actions/order";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    snap: any;
  }
}

const Checkout = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const cartItems = useAppSelector(selectCartItems);
  const totalPrice = useAppSelector(selectTotalPrice);
  const totalWeight = useAppSelector(selectTotalWeight);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapLoaded, setSnapLoaded] = useState(false);

  useEffect(() => {
    const midtransScriptUrl = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

    const script = document.createElement("script");
    script.src = midtransScriptUrl;
    script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
    script.onload = () => setSnapLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id && !session?.user?.email) {
      setError("Please login to checkout");
      return;
    }
    if (cartItems.length === 0) {
      setError("Cart is empty");
      return;
    }
    if (!snapLoaded) {
      setError("Payment system is loading, please wait...");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const orderData = {
        userId: session.user.id!,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          weight: item.weight,
        })),
        shippingData: {
          shippingCost: 1500,
          totalWeight: totalWeight,
        },
        paymentData: {
          paymentMethod: "midtrans",
          paymentAmount: totalPrice + 1500,
        },
        customerDetails: {
          firstName: session.user.name?.split(" ")[0] || "Customer",
          lastName: session.user.name?.split(" ").slice(1).join(" "),
          email: session.user.email!,
          phone: "08123456789",
        },
      };

      const result = await createOrder(orderData);
      if (result.success && result.paymentToken) {
        window.snap.pay(result.paymentToken, {
          onSuccess: function(result: any) {
            router.push(`/mail-success?orderId=${result.order_id}`);
          },
          onPending: function(result: any) {
            router.push(`/mail-success?orderId=${result.order_id}&status=pending`);
          },
          onError: function(result: any) {
            setError("Payment failed. Please try again.");
            setIsSubmitting(false);
          },
          onClose: function() {
            setIsSubmitting(false);
          }
        });
      } else {
        setError(result.error || "Failed to create order");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* <!-- checkout left --> */}
              <div className="lg:max-w-[670px] w-full">
                {/* <!-- login box --> */}
                <Login />

                {/* <!-- billing details --> */}
                <Billing />

                {/* <!-- address box two --> */}
                <Shipping />

                {/* <!-- others note box --> */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <div>
                    <label htmlFor="notes" className="block mb-2.5">
                      Other Notes (optional)
                    </label>

                    <textarea
                      name="notes"
                      id="notes"
                      rows={5}
                      placeholder="Notes about your order, e.g. speacial notes for delivery."
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* // <!-- checkout right --> */}
              <div className="max-w-[455px] w-full">
                {/* <!-- order list box --> */}
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">
                      Your Order
                    </h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    {/* <!-- title --> */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <h4 className="font-medium text-dark">Product</h4>
                      </div>
                      <div>
                        <h4 className="font-medium text-dark text-right">
                          Subtotal
                        </h4>
                      </div>
                    </div>

                    {/* <!-- product items from cart --> */}
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-5 border-b border-gray-3">
                        <div>
                          <p className="text-dark">{item.name} x {item.quantity}</p>
                        </div>
                        <div>
                          <p className="text-dark text-right">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* <!-- shipping fee --> */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <p className="text-dark">Shipping Fee</p>
                      </div>
                      <div>
                        <p className="text-dark text-right">Rp 15.000</p>
                      </div>
                    </div>

                    {/* <!-- total --> */}
                    <div className="flex items-center justify-between pt-5">
                      <div>
                        <p className="font-medium text-lg text-dark">Total</p>
                      </div>
                      <div>
                        <p className="font-medium text-lg text-dark text-right">
                          {formatCurrency(totalPrice + 1500)}
                        </p>
                      </div>
                    </div>

                    {error && (
                      <div className="mt-4 p-4 bg-red-100 text-red rounded-lg">
                        {error}
                      </div>
                    )}
                  </div>
                </div>

                {/* <!-- coupon box --> */}
                <Coupon />

                {/* <!-- shipping box --> */}
                <ShippingMethod />

                {/* <!-- payment box --> */}
                <PaymentMethod />

                {/* <!-- checkout button --> */}
                <button
                  type="submit"
                  disabled={isSubmitting || cartItems.length === 0}
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Processing..." : "Process to Checkout"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;
