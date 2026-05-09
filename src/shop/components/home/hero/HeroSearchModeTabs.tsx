"use client";

import { useTranslations } from "next-intl";

export type HeroSearchMode = "vehicle" | "oem";

type HeroSearchModeTabsProps = Readonly<{
  mode: HeroSearchMode;
  onModeChange: (mode: HeroSearchMode) => void;
}>;

export function HeroSearchModeTabs({
  mode,
  onModeChange,
}: HeroSearchModeTabsProps) {
  const t = useTranslations("hero");

  return (
    <div className="w-full max-w-2xl mx-auto mb-6 md:mb-8" role="tablist">
      <div className="flex w-full gap-1 rounded-full bg-secondary/30 p-1.5 backdrop-blur-sm">
        <button
          className={[
            "flex-1 rounded-full px-4 py-2.5 text-center cursor-pointer text-xs font-semibold tracking-wide uppercase transition-colors sm:text-sm sm:py-3",
            mode === "vehicle"
              ? "bg-primary text-white shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
              : "text-white/65 hover:text-white",
          ].join(" ")}
          onClick={() => onModeChange("vehicle")}
          role="tab"
          type="button"
          aria-selected={mode === "vehicle"}
        >
          {t("heroModeVehicle")}
        </button>
        <button
          className={[
            "flex-1 rounded-full px-4 py-2.5 cursor-pointer text-center text-xs font-semibold tracking-wide uppercase transition-colors sm:text-sm sm:py-3",
            mode === "oem"
              ? "bg-primary text-white shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
              : "text-white/65 hover:text-white",
          ].join(" ")}
          onClick={() => onModeChange("oem")}
          role="tab"
          type="button"
          aria-selected={mode === "oem"}
        >
          {t("heroModePart")}
        </button>
      </div>
    </div>
  );
}
