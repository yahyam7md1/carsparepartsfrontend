import { ProductGrid } from "./ProductGrid";

const SKELETON_COUNT = 8;

export function ProductsSkeletonGrid() {
  return (
    <ProductGrid cols="plp">
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <article
          key={i}
          className="flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200/90 bg-white shadow-sm"
        >
          <div className="aspect-[4/3] w-full animate-pulse bg-neutral-200/60" />
          <div className="flex flex-col gap-2 p-4">
            <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-200/60" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200/60" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-200/60" />
            <div className="mt-2 h-5 w-1/3 animate-pulse rounded bg-neutral-200/60" />
          </div>
          <div className="flex flex-col gap-3 border-t border-neutral-200/70 p-4">
            <div className="h-10 w-full animate-pulse rounded-lg bg-neutral-200/60" />
            <div className="h-11 w-full animate-pulse rounded-xl bg-neutral-200/60" />
          </div>
        </article>
      ))}
    </ProductGrid>
  );
}
