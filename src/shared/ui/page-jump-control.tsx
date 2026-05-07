"use client";

import { useCallback, useEffect, useState } from "react";
import { Input } from "./input";

export type PageJumpControlProps = Readonly<{
  page: number;
  pages: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}>;

export function PageJumpControl({
  page,
  pages,
  loading,
  onPageChange,
}: PageJumpControlProps) {
  const [draft, setDraft] = useState(String(page));

  useEffect(() => {
    setDraft(String(page));
  }, [page]);

  const commit = useCallback(() => {
    const n = Number.parseInt(draft.trim(), 10);
    if (!Number.isFinite(n)) {
      setDraft(String(page));
      return;
    }
    const next = Math.min(pages, Math.max(1, n));
    if (next !== page) {
      onPageChange(next);
    }
    setDraft(String(next));
  }, [draft, page, pages, onPageChange]);

  if (pages <= 1) {
    return (
      <span className="text-foreground">
        Page {page} / {pages}
      </span>
    );
  }

  return (
    <label className="inline-flex items-center gap-1.5 text-xs text-foreground">
      <span className="text-secondary">Page</span>
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        disabled={loading}
        className="h-9 w-12 px-2 py-1 text-center text-xs font-semibold"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commit()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
        }}
        aria-label={`Go to page, between 1 and ${pages}`}
      />
      <span className="text-secondary">/</span>
      <span className="min-w-[1ch] font-medium">{pages}</span>
    </label>
  );
}
