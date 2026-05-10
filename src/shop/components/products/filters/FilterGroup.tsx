"use client";

import { ReactNode } from "react";

export type FilterGroupProps = Readonly<{
  title: string;
  children: ReactNode;
}>;

export function FilterGroup({ title, children }: FilterGroupProps) {
  return (
    <section>
      <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-secondary">
        {title}
      </h3>
      {children}
    </section>
  );
}
