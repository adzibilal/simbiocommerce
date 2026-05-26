"use server";

import { unstable_cache } from "next/cache";
import { getShippingSettings } from "./store-settings";

const RAJAONGKIR_BASE_URL = "https://rajaongkir.komerce.id/api/v1";
const CACHE_TTL = 60 * 60; // 1 jam

async function getApiKey(): Promise<string> {
  const dbSettings = await getShippingSettings();
  return dbSettings?.apiKey || process.env.RAJAONGKIR_API_KEY || "";
}

export interface DomesticDestination {
  id: number;
  label: string;
  subdistrict_name: string;
  district_name: string;
  city_name: string;
  province_name: string;
  zip_code: string;
}

export async function searchDomesticDestination(query: string, limit = 10) {
  try {
    const apiKey = await getApiKey();
    const url = `${RAJAONGKIR_BASE_URL}/destination/domestic-destination?search=${encodeURIComponent(query)}&limit=${limit}`;
    const response = await fetch(url, { headers: { key: apiKey } });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}`, results: [] as DomesticDestination[] };
    }

    const data = await response.json();
    const results: DomesticDestination[] = data.data ?? [];
    return { success: true, results };
  } catch (error: any) {
    console.error("Failed to search destination:", error);
    return { success: false, error: error.message, results: [] as DomesticDestination[] };
  }
}

// Rounded weight untuk meningkatkan cache hit rate
// Dibulatkan ke 500g terdekat (min 500g)
function roundWeight(weight: number): number {
  return Math.max(500, Math.ceil(weight / 500) * 500);
}

async function fetchShippingCostFromAPI(params: {
  origin: number;
  destination: number;
  weight: number;
  courier: string;
  apiKey: string;
}) {
  const body = new URLSearchParams({
    origin: String(params.origin),
    destination: String(params.destination),
    weight: String(params.weight),
    courier: params.courier,
  });

  const response = await fetch(`${RAJAONGKIR_BASE_URL}/calculate/domestic-cost`, {
    method: "POST",
    headers: {
      key: params.apiKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const data = await response.json();

  if (!response.ok || data?.meta?.code !== 200) {
    throw new Error(data?.meta?.message ?? `HTTP ${response.status}`);
  }

  return data.data ?? [];
}

export async function calculateShippingCost(params: {
  origin: number;
  destination: number;
  weight: number;
  courier: string;
}) {
  const apiKey = await getApiKey();
  const roundedWeight = roundWeight(params.weight);

  const cacheKey = `shipping-${params.origin}-${params.destination}-${roundedWeight}-${params.courier}`;

  const cachedFetch = unstable_cache(
    async () => {
      return fetchShippingCostFromAPI({ ...params, weight: roundedWeight, apiKey });
    },
    [cacheKey],
    { revalidate: CACHE_TTL, tags: ["shipping-rates"] }
  );

  try {
    const results = await cachedFetch();
    return { success: true, results, isOffline: false };
  } catch (error: any) {
    console.error(`[shipping] calculateShippingCost failed (${params.courier}):`, error.message);
    return { success: false, error: error.message, results: [], isOffline: true };
  }
}
