"use client";
import { SessionProvider } from "next-auth/react";
import { ReduxProvider } from "@/redux/provider";

export default function AuthProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ReduxProvider>
        {children}
      </ReduxProvider>
    </SessionProvider>
  );
}
