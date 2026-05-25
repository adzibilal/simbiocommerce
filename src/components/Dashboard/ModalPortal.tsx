"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Renders modal UI at document.body so position:fixed covers the full viewport
 * (including the admin header). Avoids gaps when modals live inside scroll/padded main.
 */
export default function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(children, document.body);
}
