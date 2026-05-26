import Signup from "@/components/Auth/Signup";
import { getStoreInfo } from "@/app/actions/store-info";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | SimbioCommerce",
};

export default async function SignupPage() {
  const storeInfo = await getStoreInfo();
  return (
    <Signup
      storeName={storeInfo?.storeName || "SimbioCommerce"}
      logoUrl={storeInfo?.logoUrl || null}
    />
  );
}
