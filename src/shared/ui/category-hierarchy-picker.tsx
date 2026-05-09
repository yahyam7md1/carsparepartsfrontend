"use client";

import { ChevronDown, CornerDownRight, Search } from "lucide-react";
import clsx from "clsx";
import type { CategoryTreeNode } from "@/lib/api/types";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEventHandler,
} from "react";

/** Minimal flat category shape — matches admin list and public tree leaves when flattened. */
export type CategoryHierarchyPickerRow = Readonly<{
  id: number;
  parentId: number | null;
  nameEn: string;
  nameAr: string;
  slug?: string;
}>;

export type CategoryHierarchyPickerLocale = "en" | "ar";

export type CategoryHierarchyPickerProps = Readonly<{
  categories: CategoryHierarchyPickerRow[];
  locale: CategoryHierarchyPickerLocale;
  value: number | "";
  onChange: (id: number | "") => void;
  /** `filter`: allow clearing to "" (all categories). `select`: choose one category only. */
  mode: "filter" | "select";
  disabled?: boolean;
  className?: string;
  /** When `mode="filter"` and `value === ""`. */
  allCategoriesLabel?: string;
  /** When `mode="select"` and `value === ""`. */
  placeholder?: string;
  searchPlaceholder?: string;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  /** Compact trigger for dense admin forms. */
  dense?: boolean;
}>;

type DisplayRow = Readonly<{
  id: number;
  depth: number;
  label: string;
  subtitle: string;
}>;

function pickLabel(row: CategoryHierarchyPickerRow, locale: CategoryHierarchyPickerLocale): string {
  return locale === "ar" ? row.nameAr : row.nameEn;
}

function ancestorPathSubtitle(
  rowId: number,
  byId: Map<number, CategoryHierarchyPickerRow>,
  locale: CategoryHierarchyPickerLocale,
): string {
  const parts: string[] = [];
  let cur = byId.get(rowId)?.parentId;
  while (cur != null) {
    const node = byId.get(cur);
    if (!node) break;
    parts.unshift(pickLabel(node, locale));
    cur = node.parentId;
  }
  return parts.join(" > ");
}

function buildDisplayRows(
  categories: CategoryHierarchyPickerRow[],
  locale: CategoryHierarchyPickerLocale,
): DisplayRow[] {
  if (categories.length === 0) return [];
  const byId = new Map(categories.map((c) => [c.id, c]));
  const childrenOf = new Map<number | "root", CategoryHierarchyPickerRow[]>();
  for (const c of categories) {
    const key = c.parentId ?? "root";
    const bucket = childrenOf.get(key);
    if (bucket) bucket.push(c);
    else childrenOf.set(key, [c]);
  }
  for (const [, arr] of childrenOf) {
    arr.sort((a, b) =>
      pickLabel(a, locale).localeCompare(pickLabel(b, locale), undefined, {
        sensitivity: "base",
      }),
    );
  }
  const out: DisplayRow[] = [];
  function walk(parentKey: number | "root", depth: number): void {
    const kids = childrenOf.get(parentKey) ?? [];
    for (const c of kids) {
      const subtitle = ancestorPathSubtitle(c.id, byId, locale);
      out.push({
        id: c.id,
        depth,
        label: pickLabel(c, locale),
        subtitle,
      });
      walk(c.id, depth + 1);
    }
  }
  walk("root", 0);
  return out;
}

function defaultCopy(locale: CategoryHierarchyPickerLocale): Readonly<{
  allCategories: string;
  placeholder: string;
  search: string;
}> {
  return locale === "ar"
    ? {
        allCategories: "جميع الفئات",
        placeholder: "اختر الفئة…",
        search: "بحث في الفئات…",
      }
    : {
        allCategories: "All categories",
        placeholder: "Select category…",
        search: "Search categories…",
      };
}

export function CategoryHierarchyPicker({
  categories,
  locale,
  value,
  onChange,
  mode,
  disabled = false,
  className,
  allCategoriesLabel,
  placeholder,
  searchPlaceholder,
  id: idProp,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  dense = false,
}: CategoryHierarchyPickerProps) {
  const reactId = useId();
  const listboxId = idProp ?? `category-picker-${reactId}`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const copy = defaultCopy(locale);
  const allLabel = allCategoriesLabel ?? copy.allCategories;
  const placeholderText = placeholder ?? copy.placeholder;
  const searchPh = searchPlaceholder ?? copy.search;

  const rows = useMemo(
    () => buildDisplayRows(categories, locale),
    [categories, locale],
  );

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const hay = `${r.subtitle} ${r.label}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query]);

  const triggerLabel = useMemo(() => {
    if (mode === "filter" && value === "") return allLabel;
    if (mode === "select" && value === "") return placeholderText;
    const row = categories.find((c) => c.id === value);
    if (!row) return mode === "filter" ? allLabel : placeholderText;
    return pickLabel(row, locale);
  }, [mode, value, categories, locale, allLabel, placeholderText]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (el && !el.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const pickAll = useCallback(() => {
    onChange("");
    setOpen(false);
    setQuery("");
  }, [onChange]);

  const pickId = useCallback(
    (id: number) => {
      onChange(id);
      setOpen(false);
      setQuery("");
    },
    [onChange],
  );

  const showAllRow = mode === "filter" && query.trim() === "";

  return (
    <div ref={wrapRef} className={clsx("relative", className)}>
      <button
        type="button"
        id={listboxId}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        onClick={() => !disabled && setOpen((o) => !o)}
        dir={locale === "ar" ? "rtl" : "ltr"}
        className={clsx(
          "flex w-full min-h-11 items-center justify-between gap-3 rounded-lg border border-secondary/25 bg-background ps-3 pe-5 py-2.5 text-start text-sm text-foreground shadow-sm transition-colors",
          dense && "min-h-9 py-2 text-xs",
          "hover:bg-background focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35",
          disabled && "cursor-not-allowed opacity-60",
          value === "" && mode === "select" && "text-secondary",
        )}
      >
        <span className="min-w-0 flex-1 truncate text-start">{triggerLabel}</span>
        <ChevronDown
          className={clsx(
            "size-4 shrink-0 text-secondary transition-transform",
            open && "rotate-180",
          )}
          strokeWidth={2}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl border border-secondary/20 bg-white shadow-lg ring-1 ring-primary/5"
          dir={locale === "ar" ? "rtl" : "ltr"}
          role="listbox"
          aria-labelledby={listboxId}
        >
          <div className="border-b border-secondary/15 p-2">
            <SearchFieldLite
              value={query}
              onChange={(v) => setQuery(v)}
              placeholder={searchPh}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setOpen(false);
                  setQuery("");
                }
              }}
            />
          </div>
          <ul className="max-h-56 overflow-y-auto px-1.5 py-1">
            {showAllRow ? (
              <li className="py-px">
                <button
                  type="button"
                  role="option"
                  aria-selected={value === ""}
                  onClick={pickAll}
                  className={clsx(
                    "flex w-full rounded-lg px-2.5 py-2 text-start text-xs font-medium transition-colors",
                    value === ""
                      ? "bg-accent/15 text-primary"
                      : "text-foreground hover:bg-primary/[0.06]",
                  )}
                >
                  {allLabel}
                </button>
              </li>
            ) : null}
            {filteredRows.length === 0 ? (
              <li className="px-2 py-3 text-center text-xs text-secondary">
                {locale === "ar" ? "لا توجد نتائج." : "No categories match."}
              </li>
            ) : (
              filteredRows.map((r) => {
                const selected = value === r.id;
                const indentRem = 0.65 + r.depth * 0.85;
                return (
                  <li key={r.id} className="py-px">
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => pickId(r.id)}
                      style={{
                        paddingInlineStart: `${indentRem}rem`,
                      }}
                      className={clsx(
                        "flex w-full flex-col items-start gap-0.5 rounded-lg py-2 pe-2.5 text-start transition-colors",
                        selected
                          ? "bg-accent/15 text-primary"
                          : "text-foreground hover:bg-primary/[0.06]",
                      )}
                    >
                      <span className="flex items-center gap-1.5 text-xs font-semibold">
                        {r.depth > 0 ? (
                          <CornerDownRight
                            className="size-3 shrink-0 text-secondary"
                            strokeWidth={2}
                            aria-hidden
                          />
                        ) : null}
                        <span>{r.label}</span>
                      </span>
                      {r.subtitle ? (
                        <span className="text-[0.65rem] font-normal leading-snug text-secondary">
                          {r.subtitle}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/** Compact search row inside the dropdown (no duplicate SearchField shell ring clash). */
function SearchFieldLite({
  value,
  onChange,
  placeholder,
  onKeyDown,
}: Readonly<{
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
}>) {
  return (
    <div className="relative rounded-lg border border-accent/40 bg-white shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-accent/25">
      <Search
        className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-secondary"
        strokeWidth={2}
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className="min-h-9 w-full rounded-lg border-0 bg-transparent py-2 ps-9 pe-3 text-start text-xs text-foreground outline-none ring-0 placeholder:text-secondary/70"
      />
    </div>
  );
}

/** Flatten `GET /api/categories` tree for {@link CategoryHierarchyPicker}. */
export function flattenCategoryTreeForPicker(
  nodes: readonly CategoryTreeNode[],
): CategoryHierarchyPickerRow[] {
  const out: CategoryHierarchyPickerRow[] = [];
  function walk(list: readonly CategoryTreeNode[]): void {
    for (const n of list) {
      out.push({
        id: n.id,
        parentId: n.parentId,
        nameEn: n.nameEn,
        nameAr: n.nameAr,
        slug: n.slug,
      });
      if (n.children.length > 0) walk(n.children);
    }
  }
  walk(nodes);
  return out;
}
