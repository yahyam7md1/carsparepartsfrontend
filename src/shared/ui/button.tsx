import clsx from "clsx";
import {
  forwardRef,
  type ButtonHTMLAttributes,
} from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "sm";

export type ButtonProps = Readonly<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  }
>;

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-sm hover:opacity-95 active:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
  secondary:
    "border border-primary/20 bg-white text-primary hover:bg-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  ghost:
    "text-primary hover:bg-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
};

const sizeClass: Record<ButtonSize, string> = {
  md: "min-h-11 rounded-xl px-5 py-2.5 text-sm font-semibold gap-2",
  sm: "min-h-9 rounded-lg px-3 py-2 text-xs font-semibold gap-1.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", size = "md", type = "button", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={clsx(
          "inline-flex cursor-pointer items-center justify-center transition-opacity disabled:pointer-events-none disabled:opacity-50",
          variantClass[variant],
          sizeClass[size],
          className,
        )}
        {...props}
      />
    );
  },
);
