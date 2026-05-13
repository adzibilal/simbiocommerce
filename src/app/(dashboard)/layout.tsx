import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import AuthProvider from "@/app/context/AuthProvider";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" containerStyle={{ zIndex: 100000 }} />
        </AuthProvider>
      </body>
    </html>
  );
}
