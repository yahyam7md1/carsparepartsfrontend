import { adminApi } from "../adminClient";
import type { AdminLowStockRowsResponse, AdminStats } from "../types";

export async function fetchAdminStats(): Promise<AdminStats> {
  const { data } = await adminApi.get<AdminStats>("/api/admin/stats");
  return data;
}

export async function fetchAdminLowStockRows(params?: {
  page?: number;
  limit?: number;
  q?: string;
}): Promise<AdminLowStockRowsResponse> {
  const { data } = await adminApi.get<AdminLowStockRowsResponse>("/api/admin/stats/low-stock", {
    params,
  });
  return data;
}

export async function ignoreAdminLowStockRow(productId: string): Promise<void> {
  await adminApi.patch(`/api/admin/stats/low-stock/${encodeURIComponent(productId)}/ignore`);
}
