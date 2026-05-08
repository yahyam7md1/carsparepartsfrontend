import { adminApi } from "../adminClient";
import type { AdminVehicleListRow, VehicleDto } from "../types";

export type AdminVehiclesParams = {
  page?: number;
  limit?: number;
  brand?: string;
  q?: string;
};

export type AdminVehiclesResponse = {
  vehicles: AdminVehicleListRow[];
  total: number;
  page: number;
  limit: number;
};

export type CreateVehicleBody = {
  brand: string;
  series: string;
  specifics: string;
  chassisCode: string;
  yearRange: string;
  /** Optional model generation / facelift label (e.g. LCI). */
  generation?: string | null;
  nameEn?: string;
  nameAr?: string;
};

export type UpdateVehicleBody = Partial<CreateVehicleBody>;

export async function fetchAdminVehicles(
  params?: AdminVehiclesParams,
): Promise<AdminVehiclesResponse> {
  const { data } = await adminApi.get<AdminVehiclesResponse>("/api/admin/vehicles", {
    params,
  });
  return data;
}

export async function fetchAdminVehicle(id: number): Promise<VehicleDto> {
  const { data } = await adminApi.get<{ vehicle: VehicleDto }>(
    `/api/admin/vehicles/${id}`,
  );
  return data.vehicle;
}

export async function createAdminVehicle(
  body: CreateVehicleBody,
): Promise<VehicleDto> {
  const { data } = await adminApi.post<{ vehicle: VehicleDto }>(
    "/api/admin/vehicles",
    body,
  );
  return data.vehicle;
}

export async function updateAdminVehicle(
  id: number,
  body: UpdateVehicleBody,
): Promise<VehicleDto> {
  const { data } = await adminApi.put<{ vehicle: VehicleDto }>(
    `/api/admin/vehicles/${id}`,
    body,
  );
  return data.vehicle;
}

export async function deleteAdminVehicle(id: number): Promise<void> {
  await adminApi.delete(`/api/admin/vehicles/${id}`);
}

export async function mergeVehicleFitmentsApi(body: {
  sourceVehicleId: number;
  targetVehicleId: number;
}): Promise<{ fitmentsCreated: number }> {
  const { data } = await adminApi.post<{ fitmentsCreated: number }>(
    "/api/admin/vehicles/merge-fitments",
    body,
  );
  return data;
}
