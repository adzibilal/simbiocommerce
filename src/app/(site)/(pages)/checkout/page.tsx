import React from "react";
import Checkout from "@/components/Checkout";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import { getPaymentSettings, getShippingOrigins } from "@/app/actions/store-settings";
import { getUserById } from "@/app/actions/user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/checkout", {
    title: "Checkout | SimbioCommerce",
    description: "Complete your purchase securely.",
  });
}

const CheckoutPage = async () => {
  const [paymentSettings, shippingOrigins, session] = await Promise.all([
    getPaymentSettings(),
    getShippingOrigins(),
    getServerSession(authOptions),
  ]);

  const defaultOrigin = shippingOrigins.find((o) => o.isDefault && o.isActive) ?? shippingOrigins[0];

  const userProfile = session?.user?.id ? await getUserById(session.user.id) : null;

  return (
    <main>
      <Checkout
        paymentSettings={paymentSettings}
        originCityId={defaultOrigin?.cityId ?? null}
        userProfile={userProfile}
      />
    </main>
  );
};

export default CheckoutPage;
