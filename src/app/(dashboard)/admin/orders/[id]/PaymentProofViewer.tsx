"use client";
import { useState } from "react";
import Image from "next/image";

export default function PaymentProofViewer({ src }: { src: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="block group">
        <img
          src={src}
          alt="Bukti Transfer"
          className="rounded-xl border border-gray-3 w-48 object-cover hover:opacity-80 transition-opacity cursor-zoom-in"
        />
        <p className="text-xs text-blue mt-1 group-hover:underline">Klik untuk perbesar</p>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-99999 bg-dark/80 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            <img
              src={src}
              alt="Bukti Transfer"
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-1.5 text-white text-sm hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Buka di tab baru
            </a>
          </div>
        </div>
      )}
    </>
  );
}
