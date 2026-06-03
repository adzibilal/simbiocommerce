import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import AuthProvider from "@/app/context/AuthProvider";
import { Toaster } from "react-hot-toast";
import ServiceWorkerRegister from "@/components/Notification/ServiceWorkerRegister";
import { getStoreInfo } from "@/app/actions/store-info";
import { buildPrimaryColorStyle } from "@/lib/color-utils";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const storeInfo = await getStoreInfo();
  const name = storeInfo?.storeName || "SimbioCommerce";
  return {
    title: { template: `%s | ${name} Admin`, default: `${name} Admin` },
    icons: {
      icon: [{ url: storeInfo?.faviconUrl || "/favicon.ico" }],
      shortcut: [{ url: storeInfo?.faviconUrl || "/favicon.ico" }],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeInfo = await getStoreInfo();
  const primaryColorStyle = buildPrimaryColorStyle(storeInfo?.primaryColor || "#3C50E0");

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        {/* eslint-disable-next-line react/no-danger */}
        <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: primaryColorStyle }} />
      </head>
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
          <ServiceWorkerRegister />
          <Toaster position="top-right" containerStyle={{ zIndex: 100000 }} />
        </AuthProvider>
      </body>
    </html>
  );
}
