import { adminApi } from "../adminClient";
import type { AdminStats } from "../types";

export async function fetchAdminStats(): Promise<AdminStats> {
  const { data } = await adminApi.get<AdminStats>("/api/admin/stats");
  return data;
}
