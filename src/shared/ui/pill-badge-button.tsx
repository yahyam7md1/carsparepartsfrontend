import clsx from "clsx";
import {
  forwardRef,
  type ButtonHTMLAttributes,
} from "react";

export type PillBadgeButtonProps = Readonly<
  ButtonHTMLAttributes<HTMLButtonElement>
>;

/** Pill-shaped table badge / link-style control (flat, no border). */
export const PillBadgeButton = forwardRef<
  HTMLButtonElement,
  PillBadgeButtonProps
>(function PillBadgeButton(
  { className, disabled, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={clsx(
        "inline-flex cursor-pointer items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
        "border-0 bg-primary/[0.09] text-primary shadow-none",
        "hover:bg-primary/[0.15] hover:underline hover:underline-offset-2",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/35",
        "disabled:cursor-not-allowed disabled:bg-secondary/[0.07] disabled:text-secondary disabled:no-underline disabled:hover:bg-secondary/[0.07]",
        className,
      )}
      {...props}
    />
  );
});
