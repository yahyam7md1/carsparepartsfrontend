import clsx from "clsx";
import { forwardRef, type SelectHTMLAttributes } from "react";

export type SelectProps = Readonly<SelectHTMLAttributes<HTMLSelectElement>>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={clsx(
        "w-full rounded-lg border border-secondary/25 bg-background ps-3 pe-12 py-2.5 text-sm text-foreground shadow-sm",
        "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
