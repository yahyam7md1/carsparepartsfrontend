export { apiClient } from "./client";
export { ApiError, isApiError } from "./errors";
export type {
  CategorySummary,
  CategoryTreeNode,
  PaginatedProducts,
  ProductDetail,
  ProductFitmentsResponse,
  ProductImagePreview,
  ProductListRow,
  VehicleDto,
} from "./types";
export { fetchCategoryTree } from "./services/categories";
export {
  fetchFeaturedProducts,
  fetchProductFitments,
  fetchProductPublic,
  fetchProductsPublic,
} from "./services/products";
export type {
  FeaturedProductsParams,
  PublicProductListParams,
} from "./services/products";
export type {
  AdminVehiclesParams,
  AdminVehiclesResponse,
} from "./services/vehicles";
export { fetchAdminVehicles } from "./services/vehicles";
