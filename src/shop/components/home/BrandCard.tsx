import clsx from "clsx";
import type { IconType } from "react-icons";
import { Link } from "@/i18n/navigation";

export type BrandTileCardProps = Readonly<{
  href: string;
  label: string;
  Icon: IconType;
  /** Tailwind size classes for the icon SVG (visual weight balancing). */
  iconFrameClassName: string;
}>;

/** Single shop-by-brand tile: centered logo + name, light border, white surface. */
export function BrandCard({
  href,
  label,
  Icon,
  iconFrameClassName,
}: BrandTileCardProps) {
  return (
    <Link
      className={clsx(
        "group flex min-h-[9.5rem] flex-col items-center justify-center rounded-xl border border-neutral-200/90 bg-white px-5 py-8 text-center shadow-sm",
        "transition-all duration-200 ease-out",
        "hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg",
        "focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35",
      )}
      href={href}
    >
      <span
        aria-hidden
        className="flex min-h-20 w-full shrink-0 items-center justify-center text-secondary transition-colors duration-200 group-hover:text-primary"
      >
        <Icon className={clsx("shrink-0 object-contain", iconFrameClassName)} />
      </span>
      <span className="mt-4 text-sm font-medium tracking-tight text-primary">
        {label}
      </span>
    </Link>
  );
}
