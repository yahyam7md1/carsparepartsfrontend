"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

/**
 * `cols`:
 * - `"home"`  — 2 / lg:3 / xl:4 — used on the home page (full width, no sidebar)
 * - `"plp"`   — 2 / lg:3        — used on PLP next to the filter sidebar
 */
export type ProductGridCols = "home" | "plp";

type Props = Readonly<{
  children: ReactNode;
  className?: string;
  cols?: ProductGridCols;
}>;

const COLS_CLASS: Record<ProductGridCols, string> = {
  home: "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  plp: "grid-cols-2 lg:grid-cols-3",
};

export function ProductGrid({ children, className, cols = "home" }: Props) {
  return (
    <div className={clsx("grid gap-5", COLS_CLASS[cols], className)}>
      {children}
    </div>
  );
}
