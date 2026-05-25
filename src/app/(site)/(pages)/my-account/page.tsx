import MyAccount from "@/components/MyAccount";
import React from "react";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/my-account", {
    title: "My Account | SimbioCommerce",
    description: "Manage your account and orders.",
  });
}

const MyAccountPage = () => {
  return (
    <main>
      <MyAccount />
    </main>
  );
};

export default MyAccountPage;
