import Signin from "@/components/Auth/Signin";
import React from "react";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/signin", {
    title: "Sign In | SimbioCommerce",
    description: "Sign in to your account.",
  });
}

const SigninPage = () => {
  return (
    <main>
      <Signin />
    </main>
  );
};

export default SigninPage;
