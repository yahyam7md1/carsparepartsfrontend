"use client";

import type { ReactNode } from "react";
import { Button, Modal } from "@/shared/ui";

export type ConfirmModalProps = Readonly<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  confirmVariant?: "danger" | "primary";
}>;

export function ConfirmModal({
  open,
  onClose,
  title,
  children,
  confirmLabel,
  onConfirm,
  loading = false,
  confirmVariant = "primary",
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="primary"
            disabled={loading}
            className={
              confirmVariant === "danger"
                ? "bg-red-700 hover:opacity-95"
                : undefined
            }
            onClick={() => void onConfirm()}
          >
            {loading ? "Please wait…" : confirmLabel}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      }
    >
      <div className="text-sm text-secondary">{children}</div>
    </Modal>
  );
}
