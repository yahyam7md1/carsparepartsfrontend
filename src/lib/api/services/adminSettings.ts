import { adminApi } from "../adminClient";

export type AdminShopSettings = {
  whatsappBusinessPhoneDigits: string | null;
  whatsappGreetingNameEn: string | null;
  whatsappGreetingNameAr: string | null;
  defaultStockAlertFast: number | null;
  defaultStockAlertMedium: number | null;
  defaultStockAlertSlow: number | null;
  lowStockSlowAtOrBelow: number;
  lowStockMediumBelow: number;
  lowStockFastBelow: number;
  updatedAt: string;
};

export type PatchShopSettingsBody = Partial<{
  whatsappBusinessPhone: string | null;
  whatsappGreetingNameEn: string | null;
  whatsappGreetingNameAr: string | null;
  defaultStockAlertFast: number | null;
  defaultStockAlertMedium: number | null;
  defaultStockAlertSlow: number | null;
  lowStockSlowAtOrBelow: number;
  lowStockMediumBelow: number;
  lowStockFastBelow: number;
}>;

export async function fetchAdminShopSettings(): Promise<AdminShopSettings> {
  const { data } = await adminApi.get<{ settings: AdminShopSettings }>("/api/admin/settings");
  return data.settings;
}

export async function patchAdminShopSettings(
  body: PatchShopSettingsBody,
): Promise<AdminShopSettings> {
  const { data } = await adminApi.patch<{ settings: AdminShopSettings }>(
    "/api/admin/settings",
    body,
  );
  return data.settings;
}
