import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import clsx from "clsx";

export type QuantitySelectorProps = Readonly<{
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}>;

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 999,
  size = "md",
  className,
}: QuantitySelectorProps) {
  const t = useTranslations("product");

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number.parseInt(e.target.value, 10);
    if (!Number.isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const leftButtonClass = clsx(
    "flex items-center justify-center rounded-s-lg border border-neutral-200/90 bg-white text-primary transition-colors hover:border-primary/25 hover:bg-primary/5 disabled:pointer-events-none disabled:opacity-40",
    size === "md" && "h-10 px-4",
    size === "sm" && "h-8 px-3",
  );

  const rightButtonClass = clsx(
    "flex items-center justify-center rounded-e-lg border border-neutral-200/90 bg-white text-primary transition-colors hover:border-primary/25 hover:bg-primary/5 disabled:pointer-events-none disabled:opacity-40",
    size === "md" && "h-10 px-4",
    size === "sm" && "h-8 px-3",
  );

  const inputClass = clsx(
    "flex-1 border-y border-neutral-200/90 bg-white text-center font-semibold text-primary transition-colors focus:border-primary/50 focus:outline-none focus:ring-0",
    size === "md" && "h-10 text-sm",
    size === "sm" && "h-8 text-xs",
  );

  const iconSize = size === "md" ? "size-4" : "size-3.5";

  return (
    <div className={clsx("flex w-full items-stretch", className)}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        aria-label={t("decreaseQuantity")}
        className={leftButtonClass}
      >
        <Minus className={iconSize} strokeWidth={2} />
      </button>
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        aria-label={t("quantity")}
        className={inputClass}
      />
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        aria-label={t("increaseQuantity")}
        className={rightButtonClass}
      >
        <Plus className={iconSize} strokeWidth={2} />
      </button>
    </div>
  );
}
