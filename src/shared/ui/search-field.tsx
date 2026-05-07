"use client";

import clsx from "clsx";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Input } from "./input";

export type SearchFieldProps = Readonly<
  Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
    /** Content before the input (e.g. search icon). */
    leftAdornment?: ReactNode;
    /** Content after the input (e.g. filter button). */
    rightAdornment?: ReactNode;
    /** Merged onto the inner &lt;input&gt; (`className` styles the outer shell only). */
    inputClassName?: string;
  }
>;

export function SearchField({
  className,
  inputClassName,
  leftAdornment,
  rightAdornment,
  ...inputProps
}: SearchFieldProps) {
  return (
    <div
      className={clsx(
        "relative min-h-11 rounded-xl border border-secondary/25 bg-white shadow-sm transition-[border-color,box-shadow]",
        /** Single focus ring on the shell only — inner Input must not ring (avoids “double border”). */
        "focus-within:border-primary focus-within:ring-1 focus-within:ring-inset focus-within:ring-accent/30",
        className,
      )}
    >
      {leftAdornment ? (
        <span
          className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-secondary select-none"
          aria-hidden
        >
          {leftAdornment}
        </span>
      ) : null}
      <Input
        type="search"
        className={clsx(
          "min-h-11 w-full rounded-xl !border-0 bg-transparent shadow-none outline-none",
          "!ring-0 focus-visible:!ring-0 focus-visible:!shadow-none focus-visible:outline-none",
          leftAdornment ? "ps-10" : "ps-3",
          rightAdornment ? "pe-10" : "pe-3",
          inputClassName,
        )}
        {...inputProps}
      />
      {rightAdornment ? (
        <span className="absolute right-3 top-1/2 z-[1] flex -translate-y-1/2 items-center">
          {rightAdornment}
        </span>
      ) : null}
    </div>
  );
}
