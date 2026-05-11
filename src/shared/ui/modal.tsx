"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, type ReactNode, type Ref } from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";

export type ModalProps = Readonly<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Overrides default `max-w-lg` (and any other panel classes you pass). */
  panelClassName?: string;
  /** Merged with the fixed fullscreen flex wrapper (padding, alignment). */
  overlayClassName?: string;
  /** Merged with the dialog header row. */
  headerClassName?: string;
  /** Merged with the title `h2`. */
  titleClassName?: string;
  /** Merged with the scrollable body region. */
  bodyClassName?: string;
  /** Ref to the scrollable body container (overflow-y-auto). */
  bodyScrollRef?: Ref<HTMLDivElement>;
  /** Merged with the footer region. */
  footerClassName?: string;
}>;

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  panelClassName,
  overlayClassName,
  headerClassName,
  titleClassName,
  bodyClassName,
  bodyScrollRef,
  footerClassName,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const scrollY = window.scrollY;
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevLeft = document.body.style.left;
    const prevRight = document.body.style.right;
    const prevWidth = document.body.style.width;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.left = prevLeft;
      document.body.style.right = prevRight;
      document.body.style.width = prevWidth;
      window.scrollTo(0, scrollY);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={clsx(
        "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6",
        overlayClassName,
      )}
    >
      <button
        type="button"
        aria-label="Close dialog backdrop"
        className="absolute inset-0 bg-black/35"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={clsx(
          "relative z-10 flex w-full flex-col overflow-hidden rounded-2xl border border-secondary/20 bg-white shadow-lg ring-1 ring-primary/5",
          panelClassName ?? "max-h-[min(90vh,900px)] max-w-lg",
        )}
      >
        <header
          className={clsx(
            "flex shrink-0 items-start justify-between gap-4 border-b border-secondary/15 px-5 py-4 sm:px-6",
            headerClassName,
          )}
        >
          <h2
            id="modal-title"
            className={clsx("font-semibold text-primary", titleClassName ?? "text-lg")}
          >
            {title}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 -me-1 min-h-9 min-w-9 p-0"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-5" strokeWidth={2} />
          </Button>
        </header>
        <div
          ref={bodyScrollRef}
          className={clsx(
            "min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6",
            bodyClassName,
          )}
        >
          {children}
        </div>
        {footer ? (
          <footer
            className={clsx(
              "shrink-0 border-t border-secondary/15 bg-background px-5 py-4 sm:px-6",
              footerClassName,
            )}
          >
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
