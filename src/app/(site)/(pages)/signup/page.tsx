import Signup from "@/components/Auth/Signup";
import React from "react";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/signup", {
    title: "Sign Up | SimbioCommerce",
    description: "Create a new account.",
  });
}

const SignupPage = () => {
  return (
    <main>
      <Signup />
    </main>
  );
};

export default SignupPage;
