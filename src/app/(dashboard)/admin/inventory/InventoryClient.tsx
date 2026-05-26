"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { bulkUpdateStock } from "@/app/actions/inventory";

interface InventoryItem {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  isActive: boolean | null;
  imageUrl: string | null;
}

interface HistoryRow {
  id: string;
  productName: string | null;
  previousStock: number;
  newStock: number;
  change: number;
  reason: string | null;
  referenceId: string | null;
  changedAt: string | null;
}

interface Props {
  inventory: InventoryItem[];
  lowStock: { id: string; name: string; sku: string | null; stock: number }[];
  history: HistoryRow[];
  threshold: number;
}

const reasonLabel: Record<string, string> = {
  order: "Penjualan",
  manual_update: "Update Manual",
  bulk_update: "Bulk Update",
};

export default function InventoryClient({ inventory, lowStock, history, threshold }: Props) {
  const router = useRouter();
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"stock" | "history">("stock");
  const [search, setSearch] = useState("");

  const handleStockChange = (id: string, value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 0) {
      setStockEdits((prev) => ({ ...prev, [id]: num }));
    }
  };

  const handleSave = async () => {
    const updates = Object.entries(stockEdits).map(([productId, newStock]) => ({ productId, newStock }));
    if (!updates.length) { toast("Tidak ada perubahan"); return; }

    setSaving(true);
    const res = await bulkUpdateStock(updates);
    setSaving(false);
    if (res.success) {
      toast.success(`${updates.length} produk berhasil diupdate`);
      setStockEdits({});
      router.refresh();
    } else {
      toast.error(res.error ?? "Gagal update stok");
    }
  };

  const filteredInventory = inventory.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const changedCount = Object.keys(stockEdits).length;

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-5 font-bold text-dark">Inventory Management</h1>
          <p className="text-custom-sm text-body">Kelola stok produk dan lihat riwayat perubahan.</p>
        </div>
        {changedCount > 0 && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue text-white rounded-lg font-medium text-sm hover:bg-blue-dark transition-colors disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : `Simpan ${changedCount} Perubahan`}
          </button>
        )}
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-semibold text-orange-800 text-sm">⚠️ {lowStock.length} produk stok rendah (≤ {threshold})</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {lowStock.map((p) => (
                  <span key={p.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 text-orange-800 rounded-lg text-xs font-medium">
                    {p.name}
                    <span className="bg-orange-200 text-orange-900 px-1.5 py-0.5 rounded font-bold">{p.stock}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-1 p-1 rounded-xl w-fit">
        {(["stock", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-white text-blue shadow-sm" : "text-dark-4 hover:text-dark"}`}
          >
            {t === "stock" ? "Kelola Stok" : "Riwayat Perubahan"}
          </button>
        ))}
      </div>

      {tab === "stock" && (
        <div className="bg-white rounded-2xl shadow-1 border border-gray-2">
          <div className="p-4 border-b border-gray-2 flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-3 bg-gray-1 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
              />
            </div>
            <p className="text-xs text-dark-4">{filteredInventory.length} produk</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-2 bg-gray-1">
                  <th className="text-left py-3 px-4 font-medium text-dark-2">Produk</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-2">SKU</th>
                  <th className="text-center py-3 px-4 font-medium text-dark-2">Stok Saat Ini</th>
                  <th className="text-center py-3 px-4 font-medium text-dark-2">Update Stok</th>
                  <th className="text-center py-3 px-4 font-medium text-dark-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const edited = stockEdits[item.id];
                  const displayStock = edited !== undefined ? edited : item.stock;
                  const isLow = item.stock <= threshold;
                  const isChanged = edited !== undefined && edited !== item.stock;
                  return (
                    <tr key={item.id} className={`border-b border-gray-2 last:border-0 ${isChanged ? "bg-blue/5" : ""}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-2 border border-gray-3 overflow-hidden shrink-0">
                            {item.imageUrl
                              ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-sm">📦</div>}
                          </div>
                          <span className="font-medium text-dark text-sm">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-dark-4 font-mono text-xs">{item.sku ?? "-"}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isLow ? "bg-orange-100 text-orange-700" : "bg-green/10 text-green"
                        }`}>
                          {item.stock}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleStockChange(item.id, String(Math.max(0, displayStock - 1)))}
                            className="w-7 h-7 rounded-lg border border-gray-3 text-dark-4 hover:bg-gray-1 flex items-center justify-center text-lg leading-none"
                          >−</button>
                          <input
                            type="number"
                            min={0}
                            value={displayStock}
                            onChange={(e) => handleStockChange(item.id, e.target.value)}
                            className={`w-16 text-center py-1.5 rounded-lg border text-sm outline-none ${
                              isChanged ? "border-blue bg-blue/5 text-blue font-semibold" : "border-gray-3 bg-gray-1 text-dark"
                            } focus:ring-2 focus:ring-blue/20`}
                          />
                          <button
                            onClick={() => handleStockChange(item.id, String(displayStock + 1))}
                            className="w-7 h-7 rounded-lg border border-gray-3 text-dark-4 hover:bg-gray-1 flex items-center justify-center text-lg leading-none"
                          >+</button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.isActive ? "bg-green/10 text-green" : "bg-gray-2 text-dark-4"}`}>
                          {item.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="bg-white rounded-2xl shadow-1 border border-gray-2 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-2 bg-gray-1">
                  <th className="text-left py-3 px-4 font-medium text-dark-2">Produk</th>
                  <th className="text-center py-3 px-4 font-medium text-dark-2">Sebelum</th>
                  <th className="text-center py-3 px-4 font-medium text-dark-2">Perubahan</th>
                  <th className="text-center py-3 px-4 font-medium text-dark-2">Sesudah</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-2">Alasan</th>
                  <th className="text-left py-3 px-4 font-medium text-dark-2">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-dark-4 text-sm">Belum ada riwayat perubahan stok</td></tr>
                ) : history.map((row) => (
                  <tr key={row.id} className="border-b border-gray-2 last:border-0">
                    <td className="py-3 px-4 font-medium text-dark">{row.productName ?? "-"}</td>
                    <td className="py-3 px-4 text-center text-dark-4">{row.previousStock}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-semibold ${row.change > 0 ? "text-green" : "text-red"}`}>
                        {row.change > 0 ? `+${row.change}` : row.change}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-dark">{row.newStock}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        row.reason === "order" ? "bg-blue/10 text-blue"
                        : row.reason === "bulk_update" ? "bg-purple-100 text-purple-700"
                        : "bg-gray-2 text-dark-4"
                      }`}>
                        {reasonLabel[row.reason ?? ""] ?? row.reason ?? "-"}
                      </span>
                      {row.referenceId && (
                        <span className="ml-1.5 text-xs text-dark-4 font-mono">#{row.referenceId.slice(0, 8)}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-dark-4 text-xs whitespace-nowrap">
                      {row.changedAt ? new Date(row.changedAt).toLocaleString("id-ID") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
