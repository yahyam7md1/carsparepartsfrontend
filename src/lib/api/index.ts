export { apiClient } from "./client";
export { adminApi, setAdminUnauthorizedHandler } from "./adminClient";
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
  AdminVehicleListRow,
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
  CreateVehicleBody,
  UpdateVehicleBody,
} from "./services/vehicles";
export {
  fetchAdminVehicles,
  fetchAdminVehicle,
  createAdminVehicle,
  updateAdminVehicle,
  deleteAdminVehicle,
  mergeVehicleFitmentsApi,
} from "./services/vehicles";
export type { AdminProductListParams } from "./services/adminProducts";
export {
  fetchAdminProducts,
  fetchProductAdmin,
  replaceAdminProductFitments,
  appendVehicleToProductFitments,
} from "./services/adminProducts";
export {
  loginRequest,
  fetchAdminMe,
  logoutRequest,
} from "./services/auth";
export type { AdminUser, AdminLoginResponse } from "./types/auth";
