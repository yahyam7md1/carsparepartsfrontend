export { apiClient } from "./client";
export { adminApi, setAdminUnauthorizedHandler } from "./adminClient";
export { ApiError, isApiError } from "./errors";
export type {
  AdminCategory,
  CategorySummary,
  CategoryTreeNode,
  PaginatedProducts,
  ProductDetail,
  ProductFitmentsResponse,
  ProductImagePreview,
  ProductListRow,
  VehicleDto,
} from "./types";
export {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  fetchCategoryTree,
  updateAdminCategory,
} from "./services/categories";
export type {
  AdminCategoryPayload,
  CreateAdminCategoryBody,
  UpdateAdminCategoryBody,
} from "./services/categories";
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
export {
  loginRequest,
  fetchAdminMe,
  logoutRequest,
} from "./services/auth";
export type { AdminUser, AdminLoginResponse } from "./types/auth";
