"use client";
import React, { useState, useEffect } from "react";
import { searchDomesticDestination, DomesticDestination } from "@/app/actions/shipping";

interface ShippingProps {
  selected: DomesticDestination | null;
  onSelect: (dest: DomesticDestination | null) => void;
}

const Shipping = ({ selected, onSelect }: ShippingProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DomesticDestination[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (query.length < 3) { setResults([]); setShowResults(false); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      const r = await searchDomesticDestination(query, 10);
      setResults(r.success ? r.results : []);
      setShowResults(true);
      setSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="mt-5">
      <label className="block mb-2.5">Destination <span className="text-red">*</span></label>
      <div className="relative">
        {selected ? (
          <div className="flex items-center justify-between rounded-md border border-gray-3 bg-gray-1 py-3 px-5">
            <div>
              <p className="text-dark font-medium text-sm">{selected.subdistrict_name}, {selected.district_name}</p>
              <p className="text-xs text-dark-4">{selected.city_name}, {selected.province_name} {selected.zip_code}</p>
            </div>
            <button
              type="button"
              onClick={() => { onSelect(null); setQuery(""); }}
              className="text-xs text-blue hover:underline ml-3 shrink-0"
            >
              Change
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city or subdistrict..."
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
            {searching && <p className="text-xs text-dark-4 mt-1">Searching...</p>}
            {showResults && results.length > 0 && (
              <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-52 overflow-y-auto">
                {results.map((d) => (
                  <li
                    key={d.id}
                    onClick={() => { onSelect(d); setShowResults(false); setQuery(""); }}
                    className="px-4 py-2.5 cursor-pointer hover:bg-blue/5 border-b border-gray-100 last:border-0"
                  >
                    <p className="text-sm font-medium text-dark">{d.subdistrict_name}, {d.district_name}</p>
                    <p className="text-xs text-dark-4">{d.city_name}, {d.province_name} {d.zip_code}</p>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Shipping;
