"use client";

import { useState, useRef } from "react";
import { upload } from "@imagekit/next";
import Image from "next/image";
import { submitPaymentProof } from "@/app/actions/order";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function PaymentProofUpload({
  orderId,
  existingProof,
}: {
  orderId: string;
  existingProof?: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(existingProof ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!file) { toast.error("Pilih foto bukti transfer terlebih dahulu"); return; }
    setUploading(true);
    try {
      const authRes = await fetch("/api/upload-auth");
      const { token, expire, signature, publicKey, folder } = await authRes.json();

      const result = await upload({
        file,
        fileName: `payment-proof-${orderId}-${Date.now()}`,
        publicKey,
        signature,
        expire,
        token,
        folder: `${folder}/payment-proofs`,
      });

      await submitPaymentProof(orderId, result.url);
      toast.success("Bukti transfer berhasil dikirim! Admin akan memverifikasi pembayaran kamu.");
      setFile(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah bukti transfer");
    } finally {
      setUploading(false);
    }
  };

  if (existingProof) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Bukti transfer sudah dikirim. Menunggu konfirmasi admin.
        </div>
        <div className="rounded-xl overflow-hidden border border-gray-3 w-full max-w-xs">
          <Image src={existingProof} alt="Bukti Transfer" width={400} height={300} className="w-full h-auto object-contain" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {!preview ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-3 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-blue hover:bg-blue/5 transition-colors cursor-pointer"
        >
          <svg className="w-8 h-8 text-dark-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium text-dark">Klik untuk pilih foto</p>
          <p className="text-xs text-dark-4">JPG, PNG — max 5MB</p>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-gray-3 w-full max-w-xs">
            <Image src={preview} alt="Preview" width={400} height={300} className="w-full h-auto object-contain" />
            <button
              type="button"
              onClick={() => { setPreview(null); setFile(null); if (inputRef.current) inputRef.current.value = ""; }}
              className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-dark-4 hover:text-red transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs text-blue hover:underline"
          >
            Ganti foto
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!file || uploading}
        className="w-full py-3 bg-blue text-white font-medium rounded-xl hover:bg-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Mengunggah...
          </span>
        ) : (
          "Kirim Bukti Transfer"
        )}
      </button>
    </div>
  );
}
