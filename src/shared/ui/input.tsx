import clsx from "clsx";
import { forwardRef, type InputHTMLAttributes } from "react";

export type InputProps = Readonly<InputHTMLAttributes<HTMLInputElement>>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = "text", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={clsx(
        "w-full rounded-lg border border-secondary/25 bg-background px-3 py-2.5 text-sm text-foreground shadow-sm",
        "placeholder:text-secondary/70",
        "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "aria-invalid:border-red-500 aria-invalid:ring-red-500/25",
        className,
      )}
      {...props}
    />
  );
});
