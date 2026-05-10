"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { useCategoriesTree } from "@/hooks/useCategoriesTree";
import { useProduct } from "@/hooks/useProductDetail";
import { useCart } from "@/shop/context/cart-context";
import { getMediaUrl } from "@/shop/lib/media-url";
import { buildWhatsappMeUrl, getWhatsappChatUrlFromEnv } from "@/shop/lib/whatsapp-url";
import type { AppLocale } from "@/i18n/routing";
import { fetchShopSupportPublic } from "@/lib/api/services/shopSupport";
import { categoryBreadcrumbFromTree } from "@/shared/utils/categoryBreadcrumb";
import { ProductDescriptionCard } from "@/shop/components/pdp/ProductDescriptionCard";
import { ProductGallery } from "@/shop/components/pdp/ProductGallery";
import { MobileStickyPurchaseBar } from "@/shop/components/pdp/MobileStickyPurchaseBar";
import { ProductPurchaseCard } from "@/shop/components/pdp/ProductPurchaseCard";
import { ProductSpecsCard } from "@/shop/components/pdp/ProductSpecsCard";

type Props = Readonly<{
  productId: string;
  locale: AppLocale;
}>;

export function ProductDetailView({ productId, locale }: Props) {
  const tHome = useTranslations("home");
  const tProduct = useTranslations("product");
  const { data: product, loading, error } = useProduct(productId);
  const { data: categoriesTree } = useCategoriesTree();
  const { addLine } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [supportDigits, setSupportDigits] = useState<string | null>(null);

  useEffect(() => {
    setSelectedImageIndex(0);
    setQuantity(1);
  }, [productId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const support = await fetchShopSupportPublic();
        if (!cancelled) {
          setSupportDigits(support.whatsappPhoneDigits);
        }
      } catch {
        if (!cancelled) {
          setSupportDigits(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="h-8 w-48 animate-pulse rounded bg-secondary/20" />
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-xl bg-secondary/15" />
          <div className="space-y-4">
            <div className="h-6 w-full animate-pulse rounded bg-secondary/15" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-secondary/15" />
            <div className="h-10 w-full animate-pulse rounded bg-secondary/15" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-primary">{tHome("pdpErrorTitle")}</h1>
        <p className="mt-2 text-secondary">
          {error instanceof Error ? error.message : tHome("pdpErrorBody")}
        </p>
        <Link
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          href="/products"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {tHome("pdpBackToProducts")}
        </Link>
      </div>
    );
  }

  const title = locale === "ar" ? product.nameAr : product.nameEn;
  const description = locale === "ar" ? product.descAr : product.descEn;
  const categoryTitle = locale === "ar" ? product.category.nameAr : product.category.nameEn;
  const categoryBreadcrumb =
    categoriesTree && categoriesTree.length > 0
      ? categoryBreadcrumbFromTree(categoriesTree, product.categoryId, locale)
      : null;
  const categoryValue = categoryBreadcrumb ?? categoryTitle;
  const price = Number.parseFloat(product.price);
  const compareAtPrice =
    product.compareAtPrice == null ? null : Number.parseFloat(product.compareAtPrice);
  const maxQuantity = product.stockQuantity > 0 ? product.stockQuantity : 1;

  const selectedImage = product.images[selectedImageIndex] ?? null;
  const selectedThumbSrc = selectedImage
    ? getMediaUrl(selectedImage.urlThumb || selectedImage.urlLarge)
    : null;

  const askSpecialistText = tProduct("whatsappAskPrefill", {
    product: title,
    sku: product.sku,
    qty: quantity,
  });

  const handleAddToCart = () => {
    addLine({
      productId: product.id,
      sku: product.sku,
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      brandName: product.brandName,
      descEn: product.descEn ?? undefined,
      descAr: product.descAr ?? undefined,
      quantity,
      unitPrice: price,
      imageThumbUrl: selectedThumbSrc ?? undefined,
      stockQuantity: product.stockQuantity,
    });
  };

  const handleAskSpecialist = () => {
    const fromSupport = supportDigits?.trim()
      ? buildWhatsappMeUrl(supportDigits, { prefillText: askSpecialistText })
      : null;
    const fromEnv = getWhatsappChatUrlFromEnv({ prefillText: askSpecialistText });
    const url = fromSupport ?? fromEnv;
    if (url) {
      globalThis.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    globalThis.location.assign("/contact");
  };

  const oemValues = product.oems.map((o) => o.value).filter((v) => v.trim().length > 0);
  const conditionLabel =
    product.condition === "used"
      ? tProduct("specConditionUsed")
      : tProduct("specConditionNew");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-24 md:py-12 md:pb-12">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        href="/products"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {tHome("pdpBackToProducts")}
      </Link>

      <div className="mt-6 grid gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(360px,430px)] lg:items-start">
        <div>
          <ProductGallery
            images={product.images}
            title={title}
            selectedIndex={selectedImageIndex}
            onSelectedIndexChange={setSelectedImageIndex}
            noImageLabel={tHome("productCardNoImage")}
            prevImageLabel={tProduct("galleryPrevImage")}
            nextImageLabel={tProduct("galleryNextImage")}
          />
        </div>

        <div className="space-y-6">
          <ProductPurchaseCard
            brandName={product.brandName}
            title={title}
            sku={product.sku}
            inStock={product.stockQuantity > 0}
            stockLabel={tProduct("inStock")}
            outOfStockLabel={tHome("outOfStock")}
            priceLabel={tProduct("priceLabel")}
            vatNote={tProduct("priceVatNote")}
            price={price}
            compareAtPrice={compareAtPrice}
            quantity={quantity}
            maxQuantity={maxQuantity}
            addToCartLabel={tHome("addToCart")}
            askSpecialistLabel={tProduct("askSpecialistWhatsapp")}
            onQuantityChange={setQuantity}
            onAddToCart={handleAddToCart}
            onAskSpecialist={handleAskSpecialist}
          />

          <ProductDescriptionCard
            title={tProduct("descriptionTitle")}
            description={description}
            emptyLabel={tProduct("notAvailable")}
          />

          <ProductSpecsCard
            title={tProduct("technicalSpecificationsTitle")}
            manufacturerLabel={tProduct("specManufacturer")}
            dimensionsLabel={tProduct("specDimensions")}
            weightLabel={tProduct("specWeight")}
            categoryLabel={tProduct("specCategory")}
            conditionLabel={tProduct("specCondition")}
            oemNumbersLabel={tProduct("specOemNumbers")}
            manufacturer={product.manufacturedIn}
            dimensions={product.dimensions}
            weight={product.weight}
            category={categoryValue}
            condition={conditionLabel}
            oemValues={oemValues}
          />
        </div>
      </div>

      <MobileStickyPurchaseBar
        title={title}
        thumbSrc={selectedThumbSrc}
        price={price}
        compareAtPrice={compareAtPrice}
        addToCartLabel={tHome("addToCartShort")}
        disabled={product.stockQuantity < 1}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
