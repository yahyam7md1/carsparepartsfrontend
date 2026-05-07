"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";

export type ModalProps = Readonly<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Wider modals: pass e.g. `max-w-2xl` */
  panelClassName?: string;
}>;

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  panelClassName,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
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
          "relative z-10 flex max-h-[min(90vh,900px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-secondary/20 bg-white shadow-lg ring-1 ring-primary/5",
          panelClassName,
        )}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-secondary/15 px-5 py-4 sm:px-6">
          <h2 id="modal-title" className="text-lg font-semibold text-primary">
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
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">{children}</div>
        {footer ? (
          <footer className="shrink-0 border-t border-secondary/15 bg-background px-5 py-4 sm:px-6">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
