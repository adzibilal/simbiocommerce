import Signin from "@/components/Auth/Signin";
import { getStoreInfo } from "@/app/actions/store-info";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | SimbioCommerce",
};

export default async function SigninPage() {
  const storeInfo = await getStoreInfo();
  return (
    <Signin
      storeName={storeInfo?.storeName || "SimbioCommerce"}
      logoUrl={storeInfo?.logoUrl || null}
    />
  );
}
