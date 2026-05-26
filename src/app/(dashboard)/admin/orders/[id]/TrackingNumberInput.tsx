"use client";
import { useState } from "react";
import { updateTrackingNumber } from "@/app/actions/order";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function TrackingNumberInput({
  orderId,
  current,
}: {
  orderId: string;
  current: string | null;
}) {
  const [value, setValue] = useState(current ?? "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (!value.trim()) { toast.error("Nomor resi tidak boleh kosong"); return; }
    setSaving(true);
    try {
      await updateTrackingNumber(orderId, value.trim());
      toast.success("Nomor resi disimpan & status diubah ke Shipped");
      router.refresh();
    } catch {
      toast.error("Gagal menyimpan nomor resi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Masukkan nomor resi..."
          className="flex-1 bg-gray-1 rounded-md border border-gray-3 py-2.5 px-4 text-dark text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
        />
        <button
          onClick={handleSave}
          disabled={saving || value.trim() === (current ?? "")}
          className="px-4 py-2.5 bg-blue text-white text-sm font-medium rounded-lg hover:bg-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {saving ? "..." : "Simpan"}
        </button>
      </div>
      {current && (
        <p className="text-xs text-body">Resi saat ini: <span className="font-mono font-medium text-dark">{current}</span></p>
      )}
    </div>
  );
}
