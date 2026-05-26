import "@/app/css/euclid-circular-a-font.css";
import "@/app/css/style.css";
import AuthProviders from "./AuthProviders";
import { getStoreInfo } from "@/app/actions/store-info";
import { buildPrimaryColorStyle } from "@/lib/color-utils";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const storeInfo = await getStoreInfo();
  const primaryColorStyle = buildPrimaryColorStyle(storeInfo?.primaryColor || "#3C50E0");

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: primaryColorStyle }} />
      </head>
      <body>
        <AuthProviders>
          {children}
        </AuthProviders>
      </body>
    </html>
  );
}
