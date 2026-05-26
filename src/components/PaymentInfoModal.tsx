"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

interface Props {
  paymentMethod: "qris" | "bank_transfer";
  qrisImageUrl?: string | null;
  bankAccounts?: BankAccount[];
  autoOpen?: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        copied ? "bg-green-100 text-green-700" : "bg-white border border-gray-3 text-dark-4 hover:text-blue hover:border-blue"
      }`}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

export default function PaymentInfoModal({ paymentMethod, qrisImageUrl, bankAccounts = [], autoOpen = false }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (autoOpen) setOpen(true);
  }, [autoOpen]);

  const isQris = paymentMethod === "qris";

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-3 bg-blue text-white text-sm font-medium rounded-xl hover:bg-blue-dark transition-colors w-full justify-center"
      >
        {isQris ? (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><path d="M14 14h.01M14 17h.01M17 14h.01M17 17h3M20 14v.01"/>
            </svg>
            Lihat QRIS
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Lihat Rekening Transfer
          </>
        )}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-dark text-lg">
                {isQris ? "Bayar dengan QRIS" : "Info Transfer Bank"}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-1 text-dark-4 hover:text-dark transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* QRIS content */}
            {isQris && (
              <div className="flex flex-col items-center gap-4">
                {qrisImageUrl ? (
                  <>
                    <div className="w-full aspect-square bg-white border-2 border-gray-2 rounded-2xl overflow-hidden p-2">
                      <Image
                        src={qrisImageUrl}
                        alt="QRIS"
                        width={400}
                        height={400}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-xs text-dark-4 text-center leading-relaxed">
                      Scan menggunakan GoPay, OVO, Dana, ShopeePay, atau aplikasi bank yang mendukung QRIS.
                    </p>
                    <div className="w-full bg-blue/5 border border-blue/20 rounded-xl p-3 text-xs text-dark-4 text-center">
                      Setelah bayar, upload bukti pembayaran di halaman ini.
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-dark-4 text-center py-6">Gambar QRIS tidak tersedia. Hubungi admin.</p>
                )}
              </div>
            )}

            {/* Bank Transfer content */}
            {!isQris && (
              <div className="space-y-3">
                {bankAccounts.length === 0 ? (
                  <p className="text-sm text-dark-4 text-center py-6">Informasi rekening tidak tersedia. Hubungi admin.</p>
                ) : (
                  <>
                    {bankAccounts.map((acc) => (
                      <div key={acc.id} className="border border-gray-2 rounded-xl p-4 space-y-2">
                        <p className="text-sm font-semibold text-dark">{acc.bankName}</p>
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs text-dark-4">Nomor Rekening</p>
                            <p className="text-sm font-mono font-bold text-dark">{acc.accountNumber}</p>
                          </div>
                          <CopyButton text={acc.accountNumber} />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs text-dark-4">Atas Nama</p>
                            <p className="text-sm text-dark">{acc.accountHolder}</p>
                          </div>
                          <CopyButton text={acc.accountHolder} />
                        </div>
                      </div>
                    ))}
                    <div className="bg-blue/5 border border-blue/20 rounded-xl p-3 text-xs text-dark-4 text-center">
                      Setelah transfer, upload bukti pembayaran di halaman ini.
                    </div>
                  </>
                )}
              </div>
            )}

            <button
              onClick={() => setOpen(false)}
              className="mt-5 w-full py-3 text-sm font-medium text-dark-4 hover:text-dark border border-gray-2 hover:border-gray-4 rounded-xl transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
