"use client";
import { useState } from "react";
import { updateOrderStatus } from "@/app/actions/order";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (status === currentStatus) return;
    setSaving(true);
    try {
      await updateOrderStatus(orderId, status);
      toast.success("Status updated");
      router.refresh();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full bg-gray-1 rounded-md border border-gray-3 py-2.5 px-4 text-dark text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 capitalize"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s} className="capitalize">{s}</option>
        ))}
      </select>
      <button
        onClick={handleSave}
        disabled={saving || status === currentStatus}
        className="w-full py-2.5 px-4 bg-blue text-white text-sm font-medium rounded-lg hover:bg-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Saving..." : "Update Status"}
      </button>
    </div>
  );
}
