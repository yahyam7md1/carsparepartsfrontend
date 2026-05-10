export type CartLine = {
  productId: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  nameEn: string;
  nameAr: string;
  /** Resolved thumb URL for cart row display (optional for older persisted carts). */
  imageThumbUrl?: string;
  /** Stock at add-to-cart time; caps the stepper (fallback 999 if missing). */
  stockQuantity?: number;
};
