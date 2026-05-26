"use client";

import { useState, useRef } from "react";
import { upload } from "@imagekit/next";
import Image from "next/image";
import { submitReview } from "@/app/actions/review";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  orderId: string;
  productId: string;
  productName: string;
  customerId: string;
}

export default function ReviewForm({ orderId, productId, productName, customerId }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { toast.error("Pilih bintang rating terlebih dahulu"); return; }
    if (!comment.trim()) { toast.error("Tulis ulasan kamu terlebih dahulu"); return; }
    setSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (file) {
        const authRes = await fetch("/api/upload-auth");
        const { token, expire, signature, publicKey, folder } = await authRes.json();
        const result = await upload({
          file,
          fileName: `review-${productId}-${Date.now()}`,
          publicKey,
          signature,
          expire,
          token,
          folder: `${folder}/reviews`,
        });
        imageUrl = result.url;
      }
      const res = await submitReview({ productId, orderId, customerId, rating, comment, imageUrl });
      if (!res.success) {
        toast.error(res.error || "Gagal mengirim ulasan");
        return;
      }
      toast.success("Ulasan berhasil dikirim! Menunggu persetujuan admin.");
      setDone(true);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengirim ulasan");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Ulasan berhasil dikirim. Menunggu persetujuan admin.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm font-medium text-dark">{productName}</p>

      {/* Stars */}
      <div className="flex gap-1">
        {[1,2,3,4,5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRating(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={(hover || rating) >= s ? "#FBBF24" : "none"} stroke="#FBBF24" strokeWidth="1.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
        {rating > 0 && (
          <span className="text-sm text-dark-4 ml-2 self-center">
            {["", "Sangat Buruk", "Buruk", "Cukup", "Bagus", "Sangat Bagus"][rating]}
          </span>
        )}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Tulis ulasan kamu..."
        rows={3}
        className="w-full rounded-lg border border-gray-3 bg-gray-1 px-4 py-2.5 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 resize-none"
      />

      {/* Photo */}
      <div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        {preview ? (
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-3">
            <Image src={preview} alt="Preview" fill className="object-cover" />
            <button
              type="button"
              onClick={() => { setPreview(null); setFile(null); if (inputRef.current) inputRef.current.value = ""; }}
              className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center text-dark-4 hover:text-red"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 text-sm text-dark-4 border border-dashed border-gray-3 rounded-lg px-4 py-2 hover:border-blue hover:text-blue transition-colors"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Tambah Foto (opsional)
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="py-2.5 px-6 bg-blue text-white text-sm font-medium rounded-xl hover:bg-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Mengirim..." : "Kirim Ulasan"}
      </button>
    </form>
  );
}
