"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import type { ProductImagePreview } from "@/lib/api/types";
import { getMediaUrl } from "@/shop/lib/media-url";

type Props = Readonly<{
  images: ProductImagePreview[];
  title: string;
  selectedIndex: number;
  onSelectedIndexChange: (index: number) => void;
  noImageLabel: string;
  prevImageLabel: string;
  nextImageLabel: string;
}>;

export function ProductGallery({
  images,
  title,
  selectedIndex,
  onSelectedIndexChange,
  noImageLabel,
  prevImageLabel,
  nextImageLabel,
}: Props) {
  const hasImages = images.length > 0;
  const safeIndex = hasImages ? ((selectedIndex % images.length) + images.length) % images.length : 0;
  const selectedImage = hasImages ? images[safeIndex] : null;
  const mainSrc = selectedImage ? getMediaUrl(selectedImage.urlLarge || selectedImage.urlThumb) : "";

  const goPrev = () => {
    if (!hasImages) return;
    onSelectedIndexChange((safeIndex - 1 + images.length) % images.length);
  };

  const goNext = () => {
    if (!hasImages) return;
    onSelectedIndexChange((safeIndex + 1) % images.length);
  };

  return (
    <section className="space-y-3">
      <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl border border-secondary/10 bg-white shadow-sm ring-1 ring-secondary/10">
        {mainSrc ? (
          <Image
            alt={title}
            className="object-contain p-8"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            src={mainSrc}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-secondary">
            <div className="flex flex-col items-center gap-2">
              <Package className="size-10 stroke-[1.25]" aria-hidden />
              <p className="text-sm">{noImageLabel}</p>
            </div>
          </div>
        )}

        {images.length > 1 ? (
          <>
            <button
              type="button"
              className="absolute left-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full border border-secondary/10 bg-white/95 p-2 text-secondary shadow-sm transition hover:text-primary"
              aria-label={prevImageLabel}
              onClick={goPrev}
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full border border-secondary/10 bg-white/95 p-2 text-secondary shadow-sm transition hover:text-primary"
              aria-label={nextImageLabel}
              onClick={goNext}
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => {
            const thumbSrc = getMediaUrl(image.urlThumb || image.urlLarge);
            const isActive = index === safeIndex;
            return (
              <button
                key={image.id}
                type="button"
                className={`relative size-16 shrink-0 overflow-hidden rounded-lg border bg-white ${
                  isActive
                    ? "border-primary ring-1 ring-primary/25"
                    : "border-secondary/15 hover:border-primary/35"
                }`}
                aria-label={`${title} thumbnail ${index + 1}`}
                onClick={() => onSelectedIndexChange(index)}
              >
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  sizes="64px"
                  src={thumbSrc}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
