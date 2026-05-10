import { apiClient } from "../client";

export type ShopSupportPublicResponse = {
  whatsappPhoneDigits: string | null;
};

export async function fetchShopSupportPublic(): Promise<ShopSupportPublicResponse> {
  const { data } = await apiClient.get<ShopSupportPublicResponse>("/api/shop/support");
  return data;
}
