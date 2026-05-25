"use client";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { ModalProvider } from "@/app/context/QuickViewModalContext";
import { CartModalProvider } from "@/app/context/CartSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "@/app/context/PreviewSliderContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";
import { SessionProvider } from "next-auth/react";

import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";

interface StoreInfoData {
  storeName: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  email: string | null;
  phone: string | null;
  supportPhone: string | null;
  address: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  appStoreUrl: string | null;
  googlePlayUrl: string | null;
  copyrightText: string | null;
}

export default function ClientLayout({
  children,
  storeInfo,
}: {
  children: React.ReactNode;
  storeInfo: StoreInfoData | null;
}) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <>
      {loading ? (
        <PreLoader />
      ) : (
        <>
          <SessionProvider>
            <ReduxProvider>
              <CartModalProvider>
                <ModalProvider>
                  <PreviewSliderProvider>
                    <Header storeInfo={storeInfo} />
                    {children}

                    <QuickViewModal />
                    <CartSidebarModal />
                    <PreviewSliderModal />
                  </PreviewSliderProvider>
                </ModalProvider>
              </CartModalProvider>
            </ReduxProvider>
          </SessionProvider>
          <ScrollToTop />
          <Footer storeInfo={storeInfo} />
        </>
      )}
    </>
  );
}
