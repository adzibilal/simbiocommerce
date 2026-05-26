"use client";

import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { formatCurrency } from "@/lib/currency";
import { getOrdersForExport } from "@/app/actions/analytics";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  salesChart: { date: string; revenue: number; count: number }[];
  topProducts: { name: string | null; totalQty: number; totalRevenue: number }[];
  revenue: {
    allTime: { revenue: number; orderCount: number };
    month: { revenue: number; orderCount: number };
    week: { revenue: number; orderCount: number };
    today: { revenue: number; orderCount: number };
  };
  customers: {
    total: number;
    returning: number;
    newOnly: number;
    ordersPerMonthChart: { month: string; orders: number }[];
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const COLORS = ["#3C50E0", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#F97316", "#84CC16", "#EC4899", "#6B7280"];

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-1 border border-gray-2 p-5">
      <p className="text-xs text-dark-4 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-dark">{value}</p>
      {sub && <p className="text-xs text-dark-4 mt-1">{sub}</p>}
    </div>
  );
}

function formatMonth(m: string) {
  const [y, mo] = m.split("-");
  return new Date(+y, +mo - 1).toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
}

function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

// ─── CSV Export ──────────────────────────────────────────────────────────────

function toCSV(rows: any[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AnalyticsClient({ salesChart, topProducts, revenue, customers }: Props) {
  const [exporting, setExporting] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleExport = async () => {
    setExporting(true);
    const rows = await getOrdersForExport(fromDate || undefined, toDate || undefined);
    const csv = toCSV(rows);
    downloadCSV(csv, `orders-${new Date().toISOString().slice(0, 10)}.csv`);
    setExporting(false);
  };

  const pieData = [
    { name: "Customer Baru", value: customers.newOnly },
    { name: "Returning", value: customers.returning },
  ];

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div>
        <h1 className="text-heading-5 font-bold text-dark">Analytics & Reporting</h1>
        <p className="text-custom-sm text-body">Ringkasan penjualan, produk terlaris, dan data customer.</p>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Hari Ini" value={formatCurrency(revenue.today.revenue)} sub={`${revenue.today.orderCount} pesanan`} />
        <StatCard label="Minggu Ini" value={formatCurrency(revenue.week.revenue)} sub={`${revenue.week.orderCount} pesanan`} />
        <StatCard label="Bulan Ini" value={formatCurrency(revenue.month.revenue)} sub={`${revenue.month.orderCount} pesanan`} />
        <StatCard label="Semua Waktu" value={formatCurrency(revenue.allTime.revenue)} sub={`${revenue.allTime.orderCount} pesanan`} />
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-2xl shadow-1 border border-gray-2 p-6">
        <h2 className="font-semibold text-dark mb-4">Grafik Penjualan — 30 Hari Terakhir</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={salesChart} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3C50E0" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3C50E0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateShort}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              interval={Math.floor(salesChart.length / 7)}
            />
            <YAxis
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(v: number) => [formatCurrency(v), "Revenue"]}
              labelFormatter={formatDateShort}
              contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#3C50E0" strokeWidth={2} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-1 border border-gray-2 p-6">
          <h2 className="font-semibold text-dark mb-4">Produk Terlaris (by Qty)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11, fill: "#374151" }}
                tickLine={false}
                axisLine={false}
                width={120}
                tickFormatter={(v: string) => v?.length > 16 ? v.slice(0, 16) + "…" : v}
              />
              <Tooltip
                formatter={(v: number, name: string) => [v, name === "totalQty" ? "Terjual" : "Revenue"]}
                contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
              />
              <Bar dataKey="totalQty" fill="#3C50E0" radius={[0, 4, 4, 0]} name="Terjual" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Analytics */}
        <div className="bg-white rounded-2xl shadow-1 border border-gray-2 p-6">
          <h2 className="font-semibold text-dark mb-1">Customer Analytics</h2>
          <p className="text-xs text-dark-4 mb-4">Total: {customers.total} customer</p>
          <div className="flex gap-6 items-center">
            <PieChart width={140} height={140}>
              <Pie data={pieData} cx={65} cy={65} innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v} customer`]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </PieChart>
            <div className="space-y-2 flex-1">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i] }} />
                    <span className="text-sm text-dark-2">{d.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-dark">{d.value}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-2">
                <p className="text-xs text-dark-4 mb-2">Pesanan per bulan (6 bulan)</p>
                <ResponsiveContainer width="100%" height={60}>
                  <BarChart data={customers.ordersPerMonthChart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 9, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(v: number) => [`${v}`, "Pesanan"]} labelFormatter={formatMonth} contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="orders" fill="#10B981" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSV Export */}
      <div className="bg-white rounded-2xl shadow-1 border border-gray-2 p-6">
        <h2 className="font-semibold text-dark mb-1">Export Laporan CSV</h2>
        <p className="text-xs text-dark-4 mb-4">Download data pesanan dalam format CSV. Filter opsional berdasarkan tanggal.</p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-dark-4 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-lg border border-gray-3 bg-gray-1 px-3 py-2 text-sm text-dark outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
            />
          </div>
          <div>
            <label className="block text-xs text-dark-4 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-lg border border-gray-3 bg-gray-1 px-3 py-2 text-sm text-dark outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
            />
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-5 py-2 bg-blue text-white rounded-lg font-medium text-sm hover:bg-blue-dark transition-colors disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {exporting ? "Mengekspor..." : "Download CSV"}
          </button>
        </div>
      </div>
    </div>
  );
}
