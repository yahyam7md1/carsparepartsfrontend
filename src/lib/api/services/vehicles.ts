import { apiClient } from "../client";
import type { VehicleDto } from "../types";

export type AdminVehiclesParams = {
  page?: number;
  limit?: number;
  brand?: string;
};

export type AdminVehiclesResponse = {
  vehicles: VehicleDto[];
  total: number;
  page: number;
  limit: number;
};

export async function fetchAdminVehicles(
  accessToken: string,
  params?: AdminVehiclesParams,
): Promise<AdminVehiclesResponse> {
  const { data } = await apiClient.get<AdminVehiclesResponse>(
    "/api/admin/vehicles",
    {
      params,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return data;
}
