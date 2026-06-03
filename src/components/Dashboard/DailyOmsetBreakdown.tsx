"use client";

import React, { useEffect, useState } from "react";
import { getOmsetBreakdown } from "@/app/actions/dashboard";
import { formatCurrency } from "@/lib/currency";
import toast from "react-hot-toast";

interface BreakdownStats {
  total: { revenue: number; count: number };
  breakdown: {
    pending: { revenue: number; count: number };
    processing: { revenue: number; count: number };
    shipped: { revenue: number; count: number };
    delivered: { revenue: number; count: number };
    cancelled: { revenue: number; count: number };
  };
}

export default function DailyOmsetBreakdown() {
  const [stats, setStats] = useState<BreakdownStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);

  // Default date states (current month)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchStats = async (start: string, end: string, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setLoadingStats(true);

    try {
      const res = await getOmsetBreakdown(start, end);
      if (res.success && res.stats) {
        setStats(res.stats);
      } else if (res.error) {
        toast.error(res.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data omset");
    } finally {
      setLoading(false);
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    setStartDate(start);
    setEndDate(end);

    fetchStats(start, end, true);
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error("Tanggal awal dan akhir harus diisi");
      return;
    }
    fetchStats(startDate, endDate);
  };

  const handleReset = () => {
    const now = new Date();
    const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    setStartDate(start);
    setEndDate(end);
    fetchStats(start, end);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2 space-y-4 animate-pulse">
        <div className="h-6 bg-gray-2 rounded w-1/4"></div>
        <div className="h-10 bg-gray-2 rounded w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-2 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: "Total Omset Aktif",
      data: stats.total,
      bg: "bg-blue text-white",
      text: "text-white",
      subtext: "text-white/80",
      badge: "bg-white/20 text-white font-bold",
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Menunggu Pembayaran",
      data: stats.breakdown.pending,
      bg: "bg-yellow/10",
      text: "text-yellow-dark",
      subtext: "text-body",
      badge: "bg-yellow/15 text-yellow-dark font-bold",
      icon: (
        <svg className="w-5 h-5 text-yellow-dark" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Pesanan Dibayar",
      data: stats.breakdown.processing,
      bg: "bg-blue/5",
      text: "text-blue",
      subtext: "text-body",
      badge: "bg-blue/10 text-blue font-bold",
      icon: (
        <svg className="w-5 h-5 text-blue" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Sedang Dikirim",
      data: stats.breakdown.shipped,
      bg: "bg-purple-50/40",
      text: "text-purple-700",
      subtext: "text-body",
      badge: "bg-purple-100 text-purple-700 font-bold",
      icon: (
        <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
    },
    {
      title: "Pesanan Selesai",
      data: stats.breakdown.delivered,
      bg: "bg-green/5",
      text: "text-green",
      subtext: "text-body",
      badge: "bg-green/10 text-green font-bold",
      icon: (
        <svg className="w-5 h-5 text-green" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      title: "Dibatalkan",
      data: stats.breakdown.cancelled,
      bg: "bg-red/5",
      text: "text-red",
      subtext: "text-body",
      badge: "bg-red/10 text-red font-bold",
      icon: (
        <svg className="w-5 h-5 text-red" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-1 border border-gray-2/60 space-y-6 font-euclid-circular-a">
      {/* Title & Date Filter Summary */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
        <div>
          <h2 className="text-custom-lg font-bold text-dark">Omset Berdasarkan Status Pesanan</h2>
          <p className="text-custom-xs text-body mt-0.5">
            Breakdown omset transaksi berdasarkan periode tanggal yang dipilih.
          </p>
        </div>

        {/* Inline Date Filter Form */}
        <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-dark">Dari</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-gray-3 bg-gray-1 px-3 py-1.5 text-xs text-dark outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-dark">Sampai</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-gray-3 bg-gray-1 px-3 py-1.5 text-xs text-dark outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loadingStats}
              className="px-4 py-1.5 bg-blue text-white rounded-lg font-semibold text-xs hover:bg-blue-dark transition-colors disabled:opacity-50 shrink-0"
            >
              {loadingStats ? "Loading..." : "Filter"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={loadingStats}
              className="px-4 py-1.5 bg-white border border-gray-3 text-body rounded-lg font-semibold text-xs hover:bg-gray-1 transition-colors disabled:opacity-50 shrink-0"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Main Stats Summary & Grid Cards */}
      <div className={`space-y-6 transition-opacity duration-200 ${loadingStats ? "opacity-75" : ""}`}>
        {/* Group Breakdown Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`p-4 rounded-xl flex flex-col justify-between h-32 hover:shadow-1 transition-shadow duration-200 ${card.bg}`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${card.badge.replace("font-bold", "")}`}>
                  {card.icon}
                </div>
                <span className={`text-custom-xs px-2 py-0.5 rounded-full ${card.badge}`}>
                  {card.data.count} order
                </span>
              </div>
              <div className="mt-3">
                <span className={`text-2xs block font-medium ${card.subtext}`}>
                  {card.title}
                </span>
                <span className={`text-custom-md font-bold mt-0.5 block truncate ${card.text}`}>
                  {formatCurrency(card.data.revenue)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
