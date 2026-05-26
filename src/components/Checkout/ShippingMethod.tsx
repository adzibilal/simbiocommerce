"use client";
import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    if (!destinationCity) {
      setShippingOptions([]);
      setShippingMethod("");
      return;
    }

    const fetchShippingCosts = async () => {
      setLoading(true);
      setShippingOptions([]);
      setShippingMethod("");

      const couriers = ["jne", "tiki", "pos", "sicepat", "jnt"];
      const allOptions: any[] = [];

      for (const courier of couriers) {
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
        }
      }

      setShippingOptions(allOptions);
      setLoading(false);
    };

    // Debounce to avoid firing multiple times on rapid re-renders
    const timer = setTimeout(fetchShippingCosts, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationCity, originCity]);

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

      {!loading && shippingOptions.length === 0 && (
        <p className="text-sm text-dark-4 py-3">Tidak ada layanan pengiriman tersedia untuk tujuan ini.</p>
      )}

      {!loading && shippingOptions.length > 0 && (
        <div className="space-y-2">
          {shippingOptions.map((option, index) => {
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
    </div>
  );
};

export default ShippingMethod;
