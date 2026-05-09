import type { IconType } from "react-icons";
import { SiAudi, SiBmw, SiMini, SiVolkswagen } from "react-icons/si";
import type { BrandTileSlug } from "@/shop/lib/brand-tiles-config";

/** Simple Icons per manufacturer — frame classes balance perceived weight on the tile. */
export const BRAND_TILE_ICONS: Record<BrandTileSlug, IconType> = {
  bmw: SiBmw,
  mini: SiMini,
  vw: SiVolkswagen,
  audi: SiAudi,
};

export const BRAND_TILE_ICON_FRAME_CLASS: Record<BrandTileSlug, string> = {
  bmw: "h-10 w-10",
  vw: "h-10 w-10",
  /** Mini glyph stays light — larger frame than BMW/VW */
  mini: "h-[4.75rem] w-[4.75rem]",
  /** Audi rings — extra span to read at parity with roundels */
  audi: "h-[3.75rem] w-[5.75rem]",
};
