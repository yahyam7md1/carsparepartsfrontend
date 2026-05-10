export type CartLine = {
  productId: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  nameEn: string;
  nameAr: string;
  /** Product brand shown in cart rows (optional for older persisted carts). */
  brandName?: string;
  /** Optional short descriptions for richer cart line display. */
  descEn?: string;
  descAr?: string;
  /** Resolved thumb URL for cart row display (optional for older persisted carts). */
  imageThumbUrl?: string;
  /** Stock at add-to-cart time; caps the stepper (fallback 999 if missing). */
  stockQuantity?: number;
};
