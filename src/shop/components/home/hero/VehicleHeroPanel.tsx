"use client";

import { ArrowRight, Circle, Cog, Link2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import clsx from "clsx";
import { useId, useMemo, useState, type FormEvent } from "react";
import {
  useVehicleFacetBrands,
  useVehicleFacetSeries,
  useVehicleFacetVehicles,
} from "@/hooks/useVehicleFacets";
import type { VehicleFacetRow } from "@/lib/api/types";
import { Button, Label, Select } from "@/shared/ui";

const HERO_SELECT =
  "h-11 min-h-[2.75rem] border-white/35 bg-white py-2 text-primary shadow-none focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-white/50 disabled:cursor-not-allowed disabled:border-white/18 disabled:bg-white/22 disabled:text-white/78 disabled:opacity-100";

const HERO_LABEL =
  "mb-0 flex cursor-pointer items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-white/85";

function formatVehicleOption(v: VehicleFacetRow, locale: string): string {
  const name = locale === "ar" ? v.nameAr : v.nameEn;
  const extra = [v.generation, v.specifics, v.yearRange].filter(Boolean).join(" · ");
  return extra ? `${name} — ${extra}` : name;
}

export function VehicleHeroPanel() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const router = useRouter();
  const baseId = useId();
  const makeFieldId = `${baseId}-make`;
  const seriesFieldId = `${baseId}-series`;
  const generationFieldId = `${baseId}-generation`;

  const [brand, setBrand] = useState("");
  const [series, setSeries] = useState("");
  const [vehicleId, setVehicleId] = useState("");

  const { data: brands, loading: brandsLoading } = useVehicleFacetBrands();
  const { data: seriesList, loading: seriesLoading } = useVehicleFacetSeries(
    brand || null,
  );
  const { data: vehicles, loading: vehiclesLoading } = useVehicleFacetVehicles(
    brand || null,
    series || null,
  );

  const sortedBrands = useMemo(
    () => [...(brands ?? [])].sort((a, b) => a.localeCompare(b)),
    [brands],
  );

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (vehicleId) {
      params.set("vehicleId", vehicleId);
    } else if (brand && series) {
      params.set("q", `${brand} ${series}`.trim());
    } else if (brand) {
      params.set("q", brand);
    }
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  }

  const vehicleOptions = vehicles ?? [];

  return (
    <form
      className="grid gap-5 md:grid-cols-[1fr_1fr_minmax(0,1.2fr)_auto] md:items-end md:gap-4"
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-1.5">
        <Label className={HERO_LABEL} htmlFor={makeFieldId}>
          <Circle
            aria-hidden
            className="size-3.5 shrink-0 opacity-90"
            strokeWidth={2}
          />
          {t("heroMake")}
        </Label>
        <Select
          aria-label={t("heroMake")}
          className={HERO_SELECT}
          disabled={brandsLoading}
          id={makeFieldId}
          value={brand}
          onChange={(e) => {
            setBrand(e.target.value);
            setSeries("");
            setVehicleId("");
          }}
        >
          <option value="">{t("heroSelectMake")}</option>
          {sortedBrands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className={HERO_LABEL} htmlFor={seriesFieldId}>
          <Cog
            aria-hidden
            className="size-3.5 shrink-0 opacity-90"
            strokeWidth={2}
          />
          {t("heroSeries")}
        </Label>
        <Select
          aria-label={t("heroSeries")}
          className={HERO_SELECT}
          disabled={!brand || seriesLoading}
          id={seriesFieldId}
          value={series}
          onChange={(e) => {
            setSeries(e.target.value);
            setVehicleId("");
          }}
        >
          <option value="">
            {!brand ? t("heroSeriesPhNeedMake") : t("heroSeriesPh")}
          </option>
          {(seriesList ?? []).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className={HERO_LABEL} htmlFor={generationFieldId}>
          <Link2
            aria-hidden
            className="size-3.5 shrink-0 opacity-90"
            strokeWidth={2}
          />
          {t("heroGeneration")}
        </Label>
        <Select
          aria-label={t("heroGeneration")}
          className={HERO_SELECT}
          disabled={!brand || !series || vehiclesLoading}
          id={generationFieldId}
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
        >
          <option value="">
            {!brand
              ? t("heroGenerationPhNeedMake")
              : !series
                ? t("heroGenerationPhNeedSeries")
                : t("heroGenerationPh")}
          </option>
          {vehicleOptions.map((v) => (
            <option key={v.id} value={String(v.id)}>
              {formatVehicleOption(v, locale)}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex md:justify-end md:pb-0.5">
        <Button
          className="w-full rounded-lg shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 md:w-auto"
          type="submit"
        >
          {t("heroFindParts")}
          <ArrowRight
            aria-hidden
            className={clsx("size-4", locale === "ar" && "rotate-180")}
            strokeWidth={2}
          />
        </Button>
      </div>
    </form>
  );
}
