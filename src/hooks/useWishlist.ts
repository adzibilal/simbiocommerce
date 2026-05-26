"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  syncWishlistFromLocal,
} from "@/app/actions/wishlist";

const LS_KEY = "wishlist_ids";

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

export function useWishlist() {
  const { data: session, status } = useSession();
  const [ids, setIds] = useState<string[]>([]);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      // Guest: read from localStorage
      setIds(getLocalIds());
      setSynced(true);
      return;
    }

    // Logged in: sync localStorage → DB, then fetch DB
    const localIds = getLocalIds();
    syncWishlistFromLocal((session.user as any).id, localIds).then(() => {
      if (localIds.length > 0) {
        localStorage.removeItem(LS_KEY);
      }
      getWishlist((session.user as any).id).then((rows) => {
        setIds(rows.map((r) => r.productId));
        setSynced(true);
      });
    });
  }, [status, session]);

  const isWishlisted = useCallback((productId: string) => ids.includes(productId), [ids]);

  const toggle = useCallback(async (productId: string) => {
    const inList = ids.includes(productId);
    const newIds = inList ? ids.filter((id) => id !== productId) : [...ids, productId];
    setIds(newIds);

    if (!session?.user) {
      setLocalIds(newIds);
      return;
    }

    const userId = (session.user as any).id;
    if (inList) {
      await removeFromWishlist(userId, productId);
    } else {
      await addToWishlist(userId, productId);
    }
  }, [ids, session]);

  return { ids, isWishlisted, toggle, count: ids.length, synced };
}
