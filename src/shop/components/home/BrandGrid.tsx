import clsx from "clsx";
import { getTranslations } from "next-intl/server";
import { BrandCard } from "@/shop/components/home/BrandCard";
import {
  BRAND_TILE_ICONS,
  BRAND_TILE_ICON_FRAME_CLASS,
} from "@/shop/lib/brand-tile-icons";
import { HOME_BRAND_TILES } from "@/shop/lib/brand-tiles-config";

export async function BrandGrid() {
  const t = await getTranslations("home");

  return (
    <section aria-labelledby="shop-by-brand-heading" className="scroll-mt-8">
      <div className="mb-10 text-center">
        <h2
          className={clsx(
            "text-2xl font-semibold tracking-tight text-primary md:text-3xl",
          )}
          id="shop-by-brand-heading"
        >
          {t("shopByBrandTitle")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed text-secondary md:text-base">
          {t("shopByBrandSubtitle")}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {HOME_BRAND_TILES.map((tile) => (
          <BrandCard
            key={tile.slug}
            Icon={BRAND_TILE_ICONS[tile.slug]}
            href={`/products?q=${encodeURIComponent(tile.searchQuery)}`}
            iconFrameClassName={BRAND_TILE_ICON_FRAME_CLASS[tile.slug]}
            label={t(`brandTile_${tile.slug}`)}
          />
        ))}
      </div>
    </section>
  );
}
