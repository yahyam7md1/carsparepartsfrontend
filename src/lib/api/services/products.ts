import { apiClient } from "../client";
import type {
  PaginatedProducts,
  ProductDetail,
  ProductFitmentsResponse,
} from "../types";

/** Frontend sort vocabulary (used in URL state + UI). `"relevance"` means default DB order. */
export type ProductSort = "relevance" | "priceAsc" | "priceDesc" | "newest";

/** Backend `/api/products` accepts these snake_case sort keys (no `relevance` — omit param instead). */
export type ProductSortApi = "price_asc" | "price_desc" | "newest";

/** Map UI sort → API sort. `relevance` is intentionally absent → omit `sort` param entirely. */
export const PRODUCT_SORT_API_KEY: Partial<Record<ProductSort, ProductSortApi>> = {
  priceAsc: "price_asc",
  priceDesc: "price_desc",
  newest: "newest",
};

export type PublicProductListParams = {
  page?: number;
  limit?: number;
  /** Single category (kept for backward compat with hero/links). */
  categoryId?: number;
  /** Multi-select categories (PLP filter). */
  categoryIds?: number[];
  categorySlug?: string;
  vehicleId?: number;
  oem?: string;
  q?: string;
  /** Multi-select brand filter (matches `brandName` server-side). */
  brand?: string[];
  /** Sort key — strict API form. Use `PRODUCT_SORT_API_KEY` to map from UI `ProductSort`. */
  sort?: ProductSortApi;
};

export async function fetchProductsPublic(
  params?: PublicProductListParams,
): Promise<PaginatedProducts> {
  const { data } = await apiClient.get<PaginatedProducts>("/api/products", {
    params,
    paramsSerializer: {
      // Express-friendly: `?brand=BMW&brand=Mini`, `?categoryIds=1&categoryIds=2`
      indexes: null,
    },
  });
  return data;
}

export type FeaturedProductsParams = {
  page?: number;
  limit?: number;
};

export async function fetchFeaturedProducts(
  params?: FeaturedProductsParams,
): Promise<PaginatedProducts> {
  const { data } = await apiClient.get<PaginatedProducts>(
    "/api/products/featured",
    { params },
  );
  return data;
}

export async function fetchProductPublic(id: string): Promise<ProductDetail> {
  const { data } = await apiClient.get<{ product: ProductDetail }>(
    `/api/products/${encodeURIComponent(id)}`,
  );
  return data.product;
}

export async function fetchProductFitments(
  productId: string,
): Promise<ProductFitmentsResponse> {
  const { data } = await apiClient.get<ProductFitmentsResponse>(
    `/api/products/${encodeURIComponent(productId)}/fitments`,
  );
  return data;
}
