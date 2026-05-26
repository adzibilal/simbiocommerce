"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  trackRecentlyViewed,
  getRecentlyViewedProducts,
  syncRecentlyViewedFromLocal,
} from "@/app/actions/recently-viewed";

const LS_KEY = "recently_viewed_ids";
const MAX = 10;

function getLocalIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}
function setLocalIds(ids: string[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(ids));
}

export function useRecentlyViewed() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<any[]>([]);
  const [localIds, setLocalIds_state] = useState<string[]>([]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      setLocalIds_state(getLocalIds());
      return;
    }

    // Logged in: sync + fetch
    const ids = getLocalIds();
    syncRecentlyViewedFromLocal((session.user as any).id, ids).then(() => {
      if (ids.length > 0) localStorage.removeItem(LS_KEY);
      getRecentlyViewedProducts((session.user as any).id, MAX).then((prods) => {
        setProducts(prods as any[]);
      });
    });
  }, [status, session]);

  const track = useCallback(async (productId: string) => {
    if (!session?.user) {
      const ids = getLocalIds().filter((id) => id !== productId);
      const newIds = [productId, ...ids].slice(0, MAX);
      setLocalIds(newIds);
      setLocalIds_state(newIds);
      return;
    }
    await trackRecentlyViewed((session.user as any).id, productId);
    getRecentlyViewedProducts((session.user as any).id, MAX).then((prods) => {
      setProducts(prods as any[]);
    });
  }, [session]);

  return { products, localIds, track };
}
