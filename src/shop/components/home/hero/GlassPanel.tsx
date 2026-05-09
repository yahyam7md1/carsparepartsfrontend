"use client";

import clsx from "clsx";
import type { PropsWithChildren } from "react";

type GlassPanelProps = PropsWithChildren<{
  className?: string;
}>;

export function GlassPanel({ children, className }: GlassPanelProps) {
  return (
    <div
      className={clsx(
        "relative rounded-3xl bg-gradient-to-b from-black/20 via-black/35 to-black/30 p-5 shadow-[0_24px_80px_rgba(8,20,40,0.45)] ring-[0.5px] ring-white/12 ring-inset backdrop-blur-2xl backdrop-saturate-150 md:p-7 lg:p-8",
        className,
      )}
    >
      {/* Frosted edge highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl border-[0.5px] border-white/12"
      />
      <div className="relative">{children}</div>
    </div>
  );
}
