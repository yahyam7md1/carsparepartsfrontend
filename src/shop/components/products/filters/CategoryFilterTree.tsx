"use client";

import { useState, useMemo } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, ChevronDown, Minus } from "lucide-react";
import { useLocale } from "next-intl";
import clsx from "clsx";
import type { CategoryTreeNode } from "@/lib/api/types";

export type CategoryFilterTreeProps = Readonly<{
  tree: CategoryTreeNode[];
  selected: number[];
  /** Apply selection across multiple IDs in one URL update (cascade). */
  onToggleBranch: (ids: number[], select: boolean) => void;
}>;

type BranchState = "all" | "some" | "none";

function collectBranchIds(node: CategoryTreeNode, out: number[] = []): number[] {
  out.push(node.id);
  node.children.forEach((child) => collectBranchIds(child, out));
  return out;
}

function branchState(ids: number[], selectedSet: Set<number>): BranchState {
  let matched = 0;
  for (const id of ids) if (selectedSet.has(id)) matched += 1;
  if (matched === 0) return "none";
  if (matched === ids.length) return "all";
  return "some";
}

/**
 * Recursive collapsible category tree:
 * - Every node is its own checkbox row (leaves and parents alike).
 * - Toggling a parent cascades to every descendant (and the parent itself).
 * - Parents show a tri-state indicator (all / some / none).
 * - Subcategory groups are joined to their parent via a vertical guide line.
 */
export function CategoryFilterTree({
  tree,
  selected,
  onToggleBranch,
}: CategoryFilterTreeProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const expandedDefaults = useMemo(() => {
    const set = new Set<number>();
    const visit = (node: CategoryTreeNode): boolean => {
      const childMatches = node.children.some(visit);
      const selfMatch = selectedSet.has(node.id);
      if (childMatches || selfMatch) set.add(node.id);
      return childMatches || selfMatch;
    };
    tree.forEach(visit);
    return set;
  }, [tree, selectedSet]);

  return (
    <ul className="space-y-2">
      {tree.map((node) => (
        <CategoryNode
          key={node.id}
          node={node}
          selectedSet={selectedSet}
          onToggleBranch={onToggleBranch}
          isAr={isAr}
          defaultOpen={expandedDefaults.has(node.id)}
        />
      ))}
    </ul>
  );
}

function CategoryNode({
  node,
  selectedSet,
  onToggleBranch,
  isAr,
  defaultOpen,
}: Readonly<{
  node: CategoryTreeNode;
  selectedSet: Set<number>;
  onToggleBranch: (ids: number[], select: boolean) => void;
  isAr: boolean;
  defaultOpen: boolean;
}>) {
  const [open, setOpen] = useState(defaultOpen);
  const label = isAr ? node.nameAr : node.nameEn;
  const hasChildren = node.children.length > 0;

  const branchIds = useMemo(() => collectBranchIds(node), [node]);
  const leafState: BranchState = selectedSet.has(node.id) ? "all" : "none";
  const state: BranchState = hasChildren
    ? branchState(branchIds, selectedSet)
    : leafState;

  const handleToggle = () => {
    onToggleBranch(branchIds, state !== "all");
  };

  if (!hasChildren) {
    return (
      <li>
        <CategoryRow
          id={node.id}
          label={label}
          state={state}
          onToggle={handleToggle}
        />
      </li>
    );
  }

  return (
    <li>
      <Collapsible.Root open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-1.5">
          <Collapsible.Trigger asChild>
            <button
              type="button"
              aria-label={open ? "Collapse" : "Expand"}
              className="flex size-5 shrink-0 items-center justify-center rounded text-primary transition-colors hover:text-primary/70"
            >
              <ChevronDown
                aria-hidden
                className={clsx(
                  "size-4 transition-transform duration-200",
                  open ? "rotate-0" : "-rotate-90",
                )}
                strokeWidth={2.5}
              />
            </button>
          </Collapsible.Trigger>
          <CategoryRow
            id={node.id}
            label={label}
            state={state}
            onToggle={handleToggle}
            isParent
          />
        </div>
        <Collapsible.Content className="overflow-hidden">
          <ul className="ms-[14px] mt-1.5 space-y-1.5 border-s border-neutral-200/80 ps-3">
            {node.children.map((child) => (
              <CategoryNode
                key={child.id}
                node={child}
                selectedSet={selectedSet}
                onToggleBranch={onToggleBranch}
                isAr={isAr}
                defaultOpen={false}
              />
            ))}
          </ul>
        </Collapsible.Content>
      </Collapsible.Root>
    </li>
  );
}

function CategoryRow({
  id,
  label,
  state,
  onToggle,
  isParent = false,
}: Readonly<{
  id: number;
  label: string;
  state: BranchState;
  onToggle: () => void;
  isParent?: boolean;
}>) {
  const elementId = `cat-${id}`;
  let checked: Checkbox.CheckedState = false;
  if (state === "all") checked = true;
  else if (state === "some") checked = "indeterminate";

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2.5 py-0.5">
      <Checkbox.Root
        id={elementId}
        checked={checked}
        onCheckedChange={onToggle}
        className={clsx(
          "flex size-[18px] shrink-0 items-center justify-center rounded border bg-white transition-colors",
          state === "none"
            ? "border-neutral-300 hover:border-primary/50"
            : "border-primary bg-primary",
        )}
      >
        <Checkbox.Indicator>
          {state === "all" ? (
            <Check className="size-3.5 text-white" strokeWidth={3} />
          ) : (
            <Minus className="size-3 text-white" strokeWidth={3} />
          )}
        </Checkbox.Indicator>
      </Checkbox.Root>
      <label
        htmlFor={elementId}
        className={clsx(
          "min-w-0 cursor-pointer select-none truncate text-sm text-primary",
          isParent && "font-semibold",
        )}
      >
        {label}
      </label>
    </div>
  );
}
