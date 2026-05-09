export type BrandTileSlug = "bmw" | "mini" | "vw" | "audi";

export type HomeBrandTile = Readonly<{
  slug: BrandTileSlug;
  /** PLP full-text search hint (brand / catalog wording). */
  searchQuery: string;
}>;

export const HOME_BRAND_TILES: HomeBrandTile[] = [
  { slug: "bmw", searchQuery: "BMW" },
  { slug: "mini", searchQuery: "Mini" },
  { slug: "vw", searchQuery: "Volkswagen" },
  { slug: "audi", searchQuery: "Audi" },
];
