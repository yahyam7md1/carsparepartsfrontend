"use client";

import { Button, Modal } from "@/shared/ui";

export type AdminSimpleListModalProps = Readonly<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  lines: string[];
  emptyMessage?: string;
}>;

export function AdminSimpleListModal({
  open,
  onClose,
  title,
  subtitle,
  lines,
  emptyMessage = "No entries.",
}: AdminSimpleListModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      panelClassName="max-w-lg"
      footer={
        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {subtitle ? (
          <p className="text-sm text-secondary">{subtitle}</p>
        ) : null}
        {lines.length === 0 ? (
          <p className="py-6 text-center text-sm text-secondary">{emptyMessage}</p>
        ) : (
          <ul className="max-h-[min(50vh,400px)] divide-y divide-secondary/10 overflow-y-auto rounded-xl border border-secondary/15 bg-background/40">
            {lines.map((line, i) => (
              <li key={`${i}-${line.slice(0, 24)}`} className="px-4 py-3 text-sm text-foreground">
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
