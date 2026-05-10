import { apiClient } from "../client";
import type { AppLocale } from "@/i18n/routing";

export type WhatsappCheckoutItem = {
  sku: string;
  quantity: number;
  unitPrice: number;
  nameEn: string;
  nameAr: string;
};

export type WhatsappCheckoutRequest = {
  locale: AppLocale;
  businessDisplayName?: string;
  currencySymbol?: string;
  items: WhatsappCheckoutItem[];
  notes?: string;
};

export type WhatsappCheckoutResponse = {
  message: string;
  waUrl: string | null;
  total: string;
  currencySymbol: string;
  waUrlConfigured: boolean;
};

export async function postWhatsappCheckoutIntent(
  body: WhatsappCheckoutRequest,
): Promise<WhatsappCheckoutResponse> {
  const { data } = await apiClient.post<WhatsappCheckoutResponse>(
    "/api/checkout/whatsapp-intent",
    body,
  );
  return data;
}
