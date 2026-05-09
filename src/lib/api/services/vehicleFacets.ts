import { apiClient } from "../client";
import type { VehicleFacetRow } from "../types";

export async function fetchVehicleFacetBrands(): Promise<string[]> {
  const { data } = await apiClient.get<{ brands: string[] }>(
    "/api/vehicle-facets/brands",
  );
  return data.brands;
}

export async function fetchVehicleFacetSeries(brand: string): Promise<string[]> {
  const { data } = await apiClient.get<{ series: string[] }>(
    "/api/vehicle-facets/series",
    { params: { brand } },
  );
  return data.series;
}

export async function fetchVehicleFacetVehicles(
  brand: string,
  series: string,
): Promise<VehicleFacetRow[]> {
  const { data } = await apiClient.get<{ vehicles: VehicleFacetRow[] }>(
    "/api/vehicle-facets/vehicles",
    { params: { brand, series } },
  );
  return data.vehicles;
}
