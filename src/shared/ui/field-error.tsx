import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type FieldErrorProps = Readonly<HTMLAttributes<HTMLParagraphElement>>;

export function FieldError({ className, ...props }: FieldErrorProps) {
  return (
    <p
      role="alert"
      className={clsx(
        "rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800",
        className,
      )}
      {...props}
    />
  );
}
