"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import type { QuoteItem } from "@/lib/types";

const STORAGE_KEY = "aeym_quote_items";

type QuoteContextValue = {
  items: QuoteItem[];
  totalCount: number;
  addItem: (item: Omit<QuoteItem, "qty">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  isInQuote: (id: string) => boolean;
  clearAll: () => void;
};

const QuoteContext = createContext<QuoteContextValue | null>(null);

function readStorage(): QuoteItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Reads localStorage once on mount to hydrate client-only state; starting
    // from [] keeps the server/client first render identical (avoids a
    // hydration mismatch), so this one-time sync after mount is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(readStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage unavailable (private mode, quota) - fail silently
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<QuoteItem, "qty">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    const safeQty = Math.max(1, Math.floor(qty) || 1);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: safeQty } : i)));
  }, []);

  const isInQuote = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const clearAll = useCallback(() => setItems([]), []);

  const totalCount = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  return (
    <QuoteContext.Provider value={{ items, totalCount, addItem, removeItem, updateQty, isInQuote, clearAll }}>
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuote() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error("useQuote must be used within QuoteProvider");
  return ctx;
}
