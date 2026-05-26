"use client";
import React, { useState, useEffect, useCallback } from "react";
import { calculateShippingCost } from "@/app/actions/shipping";
import { formatCurrency } from "@/lib/currency";

// Services not relevant for regular parcel e-commerce
const HIDDEN_SERVICES = [
  // JNE trucking
  "JTR", "JTR<130", "JTR>130", "JTR>200",
  // TIKI motor & trucking
  "T60", "T25", "T15", "TRC", "TRX", "SRP",
  // POS special cargo
  "PAKETPOS DANGEROUS GOODS", "PAKETPOS VALUABLE GOODS", "POS KARGO", "PDG", "PVG", "PJB",
];

const COURIERS = ["jne", "tiki", "pos", "sicepat", "jnt"];

interface ShippingMethodProps {
  originCity: number;
  destinationCity?: number;
  weight?: number;
  onShippingSelect?: (cost: number, courier: string, service: string) => void;
}

const ShippingMethod = ({ originCity, destinationCity, weight = 1000, onShippingSelect }: ShippingMethodProps) => {
  const [shippingMethod, setShippingMethod] = useState("");
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const fetchShippingCosts = useCallback(async () => {
    if (!destinationCity) return;

    setLoading(true);
    setShippingOptions([]);
    setShippingMethod("");
    setIsOffline(false);

    const allOptions: any[] = [];
    let failedCount = 0;

    await Promise.all(
      COURIERS.map(async (courier) => {
        const result = await calculateShippingCost({
          origin: originCity,
          destination: destinationCity,
          weight,
          courier,
        });

        if (result.success && Array.isArray(result.results)) {
          result.results
            .filter((item: any) => !HIDDEN_SERVICES.includes(item.service?.toUpperCase()))
            .forEach((item: any) => {
              allOptions.push({
                courier: (item.code ?? courier).toUpperCase(),
                service: item.service,
                description: item.description,
                cost: item.cost,
                etd: item.etd,
              });
            });
        } else {
          failedCount++;
        }
      })
    );

    // Semua kurir gagal = API offline
    if (failedCount === COURIERS.length) {
      setIsOffline(true);
    }

    setShippingOptions(allOptions);
    setLoading(false);
  }, [destinationCity, originCity, weight]);

  useEffect(() => {
    if (!destinationCity) {
      setShippingOptions([]);
      setShippingMethod("");
      setIsOffline(false);
      return;
    }

    const timer = setTimeout(fetchShippingCosts, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationCity, originCity, retryCount]);

  const handleSelectShipping = (option: any) => {
    const key = `${option.courier}-${option.service}`;
    setShippingMethod(key);
    onShippingSelect?.(option.cost, option.courier, option.service);
  };

  if (!destinationCity) return null;

  return (
    <div className="mt-5">
      <h4 className="font-medium text-dark mb-3">Pilih Kurir & Layanan</h4>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-dark-4 py-3">
          <svg className="animate-spin h-4 w-4 text-blue" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Menghitung ongkir...
        </div>
      )}

      {/* API offline fallback */}
      {!loading && isOffline && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">Layanan pengiriman sementara tidak dapat diakses</p>
              <p className="text-xs text-yellow-700 mt-0.5">Silakan coba beberapa saat lagi atau hubungi kami untuk konfirmasi ongkir.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRetryCount((c) => c + 1)}
            className="flex items-center gap-2 text-sm font-medium text-yellow-800 hover:text-yellow-900 border border-yellow-300 bg-white rounded-lg px-3 py-2 hover:bg-yellow-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Coba lagi
          </button>
        </div>
      )}

      {/* Partial failure notice — some couriers failed but some succeeded */}
      {!loading && !isOffline && shippingOptions.length > 0 && (
        <div className="space-y-2">
          {shippingOptions
            .sort((a, b) => a.cost - b.cost)
            .map((option, index) => {
              const key = `${option.courier}-${option.service}`;
              return (
                <label
                  key={index}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors ${
                    shippingMethod === key ? "border-blue bg-blue/5" : "border-gray-3 hover:border-gray-4"
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping"
                    className="accent-blue"
                    checked={shippingMethod === key}
                    onChange={() => handleSelectShipping(option)}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-dark text-sm">
                      {option.courier} — {option.service}
                    </p>
                    <p className="text-xs text-dark-4">{option.description} · Est. {option.etd} hari</p>
                  </div>
                  <p className="font-semibold text-dark text-sm shrink-0">{formatCurrency(option.cost)}</p>
                </label>
              );
            })}
        </div>
      )}

      {!loading && !isOffline && shippingOptions.length === 0 && (
        <p className="text-sm text-dark-4 py-3">Tidak ada layanan pengiriman tersedia untuk tujuan ini.</p>
      )}
    </div>
  );
};

export default ShippingMethod;
