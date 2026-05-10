/** Public category tree node — GET /api/categories */
export type CategoryTreeNode = {
  id: number;
  parentId: number | null;
  nameEn: string;
  nameAr: string;
  slug: string;
  children: CategoryTreeNode[];
};

export type CategorySummary = {
  id: number;
  slug: string;
  nameEn: string;
  nameAr: string;
};

/** GET /api/admin/categories — flat row with direct product count */
export type AdminCategory = {
  id: number;
  parentId: number | null;
  nameEn: string;
  nameAr: string;
  slug: string;
  productCount: number;
};

export type ProductImagePreview = {
  id: string;
  urlThumb: string;
  urlLarge: string;
  isMain: boolean;
  sortOrder: number;
};

export type ProductOemRow = {
  id: string;
  value: string;
  sortOrder: number;
};

/** GET /api/products list row */
export type ProductListRow = {
  id: string;
  sku: string;
  categoryId: number;
  brandName: string;
  nameEn: string;
  nameAr: string;
  descEn: string | null;
  descAr: string | null;
  price: string;
  compareAtPrice: string | null;
  stockQuantity: number;
  movementClass: "slow" | "medium" | "fast";
  isFeatured: boolean;
  isActive: boolean;
  dimensions: string | null;
  weight: number | null;
  manufacturedIn: string | null;
  generation: string | null;
  condition: string;
  createdAt: string;
  updatedAt: string;
  category: CategorySummary;
  images: ProductImagePreview[];
  oems: ProductOemRow[];
  /** Present on admin list when API includes fitment aggregate. */
  fitmentCount?: number;
};

export type VehicleDto = {
  id: number;
  nameEn: string;
  nameAr: string;
  brand: string;
  series: string;
  specifics: string;
  chassisCode: string;
  yearRange: string;
  generation: string | null;
};

/** GET /api/vehicle-facets/vehicles — slim row for storefront facets. */
export type VehicleFacetRow = {
  id: number;
  brand: string;
  series: string;
  specifics: string;
  chassisCode: string;
  yearRange: string;
  nameEn: string;
  nameAr: string;
};

/** Admin vehicle list row — includes aggregate fitment count from backend. */
export type AdminVehicleListRow = VehicleDto & {
  fitmentCount?: number;
};

export type PaginatedProducts = {
  products: ProductListRow[];
  total: number;
  page: number;
  limit: number;
};

export type ProductDetail = ProductListRow & {
  images: Array<
    ProductImagePreview & {
      productId: string;
    }
  >;
  fitments: Array<{
    id: number;
    productId: string;
    vehicleId: number;
    vehicle: VehicleDto;
  }>;
};

export type ProductFitmentsResponse = {
  vehicles: VehicleDto[];
};

export type AdminStats = {
  totalProducts: number;
  outOfStockCount: number;
  lowStockCount: number;
  featuredProductCount: number;
};

export type AdminLowStockRow = {
  id: string;
  sku: string;
  nameEn: string;
  nameAr: string;
  stockQuantity: number;
  movementClass: "slow" | "medium" | "fast";
  lowStockIgnored: boolean;
};

export type AdminLowStockRowsResponse = {
  rows: AdminLowStockRow[];
  total: number;
  page: number;
  limit: number;
};
