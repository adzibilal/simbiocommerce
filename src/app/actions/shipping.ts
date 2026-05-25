"use server";

import { getShippingSettings } from "./store-settings";

const RAJAONGKIR_BASE_URL = "https://rajaongkir.komerce.id/api/v1";

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

export async function calculateShippingCost(params: {
  origin: number;
  destination: number;
  weight: number;
  courier: string;
}) {
  try {
    const apiKey = await getApiKey();
    const response = await fetch(`${RAJAONGKIR_BASE_URL}/calculate/domestic-cost`, {
      method: "POST",
      headers: {
        key: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        origin: params.origin,
        destination: params.destination,
        weight: params.weight,
        courier: params.courier,
      }),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { success: true, results: data.data ?? data };
  } catch (error: any) {
    console.error("Failed to calculate shipping cost:", error);
    return { success: false, error: error.message };
  }
}
