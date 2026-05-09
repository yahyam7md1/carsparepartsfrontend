"use client";

import { useState } from "react";
import { GlassPanel } from "@/shop/components/home/hero/GlassPanel";
import { HeroSearchModeTabs } from "@/shop/components/home/hero/HeroSearchModeTabs";
import type { HeroSearchMode } from "@/shop/components/home/hero/HeroSearchModeTabs";
import { OemSearchPanel } from "@/shop/components/home/hero/OemSearchPanel";
import { VehicleSearchPanel } from "@/shop/components/home/hero/VehicleSearchPanel";

export function HeroInteractive() {
  const [mode, setMode] = useState<HeroSearchMode>("vehicle");

  return (
    <GlassPanel className="mx-auto w-full max-w-6xl">
      <HeroSearchModeTabs mode={mode} onModeChange={setMode} />
      {mode === "vehicle" ? <VehicleSearchPanel /> : <OemSearchPanel />}
    </GlassPanel>
  );
}
