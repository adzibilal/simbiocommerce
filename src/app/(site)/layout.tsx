import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import ClientLayout from "@/components/ClientLayout";
import { getStoreInfo } from "@/app/actions/store-info";
import { buildPrimaryColorStyle } from "@/lib/color-utils";
import type { Metadata } from "next";

import CustomerChatWidget from "@/components/Chat/CustomerChatWidget";
import ServiceWorkerRegister from "@/components/Notification/ServiceWorkerRegister";

export async function generateMetadata(): Promise<Metadata> {
  const storeInfo = await getStoreInfo();
  const iconUrl = storeInfo?.faviconUrl || "/favicon.ico";
  return {
    icons: {
      icon: [{ url: iconUrl }],
      shortcut: [{ url: iconUrl }],
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
      <body>
        <ClientLayout storeInfo={storeInfo}>
          {children}
          <ServiceWorkerRegister />
          <CustomerChatWidget />
        </ClientLayout>
      </body>
    </html>
  );
}
