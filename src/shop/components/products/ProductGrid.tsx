"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

type Props = Readonly<{
  children: ReactNode;
  className?: string;
}>;

export function ProductGrid({ children, className }: Props) {
  return (
    <div
      className={clsx(
        "grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
