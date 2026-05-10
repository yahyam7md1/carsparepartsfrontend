"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CART_STORAGE_KEY } from "@/shop/types/cart-constants";
import type { CartLine } from "@/shop/types/cart";

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  if (
    o.imageThumbUrl !== undefined &&
    (typeof o.imageThumbUrl !== "string" || o.imageThumbUrl.length === 0)
  ) {
    return false;
  }
  if (
    o.stockQuantity !== undefined &&
    (typeof o.stockQuantity !== "number" ||
      !Number.isFinite(o.stockQuantity) ||
      o.stockQuantity < 0)
  ) {
    return false;
  }
  return (
    typeof o.productId === "string" &&
    typeof o.sku === "string" &&
    typeof o.nameEn === "string" &&
    typeof o.nameAr === "string" &&
    typeof o.quantity === "number" &&
    Number.isFinite(o.quantity) &&
    o.quantity > 0 &&
    typeof o.unitPrice === "number" &&
    Number.isFinite(o.unitPrice) &&
    o.unitPrice >= 0
  );
}

function parseStored(raw: string | null): CartLine[] {
  if (raw == null || raw === "") return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(isCartLine);
  } catch {
    return [];
  }
}

type CartContextValue = Readonly<{
  lines: CartLine[];
  itemCount: number;
  addLine: (line: CartLine) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  clearCart: () => void;
}>;

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    setLines(parseStored(globalThis.localStorage?.getItem(CART_STORAGE_KEY)));
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY && event.newValue != null) {
        setLines(parseStored(event.newValue));
      }
    };
    globalThis.window?.addEventListener("storage", onStorage);
    return () => globalThis.window?.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    try {
      globalThis.localStorage?.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(lines),
      );
    } catch {
      /* quota / private mode */
    }
  }, [lines]);

  const addLine = useCallback((line: CartLine) => {
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.productId === line.productId);
      if (idx === -1) {
        return [...prev, { ...line, quantity: Math.max(1, line.quantity) }];
      }
      const next = [...prev];
      const merged = next[idx]!;
      next[idx] = {
        ...merged,
        quantity: merged.quantity + Math.max(1, line.quantity),
        unitPrice: line.unitPrice,
        sku: line.sku,
        nameEn: line.nameEn,
        nameAr: line.nameAr,
        imageThumbUrl: line.imageThumbUrl ?? merged.imageThumbUrl,
        stockQuantity: line.stockQuantity ?? merged.stockQuantity,
      };
      return next;
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const q = Math.floor(quantity);
    if (q <= 0) {
      setLines((prev) => prev.filter((l) => l.productId !== productId));
      return;
    }
    setLines((prev) =>
      prev.map((l) => (l.productId === productId ? { ...l, quantity: q } : l)),
    );
  }, []);

  const removeLine = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
  }, []);

  const itemCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines],
  );

  const value = useMemo(
    () => ({
      lines,
      itemCount,
      addLine,
      setQuantity,
      removeLine,
      clearCart,
    }),
    [lines, itemCount, addLine, setQuantity, removeLine, clearCart],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
