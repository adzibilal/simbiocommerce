"use client";

import { useState } from "react";

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-custom-sm font-medium text-dark mb-2">
        {label} {required && <span className="text-red">*</span>}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-gray-1 rounded-md border ${
            error ? "border-red" : "border-gray-3"
          } py-3 px-5 pr-12 text-dark-4 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20`}
          placeholder={placeholder}
          required={required}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-5 hover:text-dark duration-200"
        >
          {showPassword ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          )}
        </button>
      </div>
      {error && <p className="mt-1 text-custom-xs text-red">{error}</p>}
    </div>
  );
}
