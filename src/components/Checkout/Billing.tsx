"use client";
import React from "react";

export interface BillingData {
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface BillingProps {
  data: BillingData;
  onChange: (data: BillingData) => void;
}

const Billing = ({ data, onChange }: BillingProps) => {
  const set = (field: keyof BillingData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...data, [field]: e.target.value });

  const inputClass =
    "rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20";

  return (
    <div className="mt-7.5">
      <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">Billing details</h2>
      <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
        <div className="flex flex-col lg:flex-row gap-5 mb-5">
          <div className="w-full">
            <label className="block mb-2.5">Full Name <span className="text-red">*</span></label>
            <input
              type="text"
              required
              placeholder="John Doe"
              value={data.name}
              onChange={set("name")}
              className={inputClass}
            />
          </div>
          <div className="w-full">
            <label className="block mb-2.5">Phone <span className="text-red">*</span></label>
            <input
              type="tel"
              required
              placeholder="08xxxxxxxxxx"
              value={data.phone}
              onChange={set("phone")}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block mb-2.5">Email <span className="text-red">*</span></label>
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={data.email}
            onChange={set("email")}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block mb-2.5">Street Address <span className="text-red">*</span></label>
          <input
            type="text"
            required
            placeholder="House number and street name"
            value={data.address}
            onChange={set("address")}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
};

export default Billing;
