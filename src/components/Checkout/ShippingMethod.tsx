"use client";
import React, { useState, useEffect } from "react";
import { calculateShippingCost } from "@/app/actions/shipping";

interface ShippingMethodProps {
  destinationCity?: number;
  weight?: number;
  onShippingSelect?: (cost: number, courier: string, service: string) => void;
}

const ShippingMethod = ({ destinationCity, weight = 1000, onShippingSelect }: ShippingMethodProps) => {
  const [shippingMethod, setShippingMethod] = useState("");
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const originCity = 501;

  useEffect(() => {
    const fetchShippingCosts = async () => {
      if (!destinationCity) return;

      setLoading(true);
      const couriers = ["jne", "tiki", "pos"];
      const allOptions: any[] = [];

      for (const courier of couriers) {
        const result = await calculateShippingCost({
          origin: originCity,
          destination: destinationCity,
          weight: weight,
          courier: courier,
        });

        if (result.success && result.results[0]) {
          const courierData = result.results[0];
          courierData.costs.forEach((cost: any) => {
            allOptions.push({
              courier: courierData.code.toUpperCase(),
              service: cost.service,
              description: cost.description,
              cost: cost.cost[0].value,
              etd: cost.cost[0].etd,
            });
          });
        }
      }

      setShippingOptions(allOptions);
      setLoading(false);
    };

    fetchShippingCosts();
  }, [destinationCity, weight]);

  const handleSelectShipping = (option: any) => {
    const key = `${option.courier}-${option.service}`;
    setShippingMethod(key);
    if (onShippingSelect) {
      onShippingSelect(option.cost, option.courier, option.service);
    }
  };

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Shipping Method</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        {loading && (
          <div className="text-center py-4">Loading shipping options...</div>
        )}

        {!loading && !destinationCity && (
          <div className="text-center py-4 text-dark-4">
            Please select destination city first
          </div>
        )}

        {!loading && destinationCity && shippingOptions.length === 0 && (
          <div className="text-center py-4 text-dark-4">
            No shipping options available
          </div>
        )}

        <div className="flex flex-col gap-4">
          {shippingOptions.map((option, index) => {
            const key = `${option.courier}-${option.service}`;
            return (
              <label
                key={index}
                htmlFor={key}
                className="flex cursor-pointer select-none items-center gap-3.5"
              >
                <div className="relative">
                  <input
                    type="radio"
                    name="shipping"
                    id={key}
                    className="sr-only"
                    onChange={() => handleSelectShipping(option)}
                  />
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full ${
                      shippingMethod === key
                        ? "border-4 border-blue"
                        : "border border-gray-4"
                    }`}
                  ></div>
                </div>

                <div className="rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-dark">
                        {option.courier} - {option.service}
                      </p>
                      <p className="text-custom-xs">{option.description}</p>
                      <p className="text-custom-xs text-dark-4">
                        Estimasi: {option.etd} hari
                      </p>
                    </div>
                    <div className="pl-4">
                      <p className="font-semibold text-dark">
                        Rp {option.cost.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShippingMethod;
