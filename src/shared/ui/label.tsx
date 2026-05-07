import clsx from "clsx";
import type { LabelHTMLAttributes, ReactNode } from "react";

export type LabelProps = Readonly<
  LabelHTMLAttributes<HTMLLabelElement> & {
    requiredIndicator?: boolean;
    children: ReactNode;
  }
>;

export function Label({
  className,
  children,
  requiredIndicator,
  ...props
}: LabelProps) {
  return (
    <label
      className={clsx(
        "text-sm font-medium text-foreground select-none",
        className,
      )}
      {...props}
    >
      {children}
      {requiredIndicator ? (
        <span className="ms-0.5 text-red-600" aria-hidden>
          *
        </span>
      ) : null}
    </label>
  );
}
