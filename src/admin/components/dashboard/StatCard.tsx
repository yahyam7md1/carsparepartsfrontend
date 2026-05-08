import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

type Tone = "default" | "warning" | "danger" | "accent";

const toneClasses: Record<Tone, string> = {
  default: "text-primary",
  warning: "text-amber-600",
  danger: "text-red-600",
  accent: "text-blue-600",
};

type Props = Readonly<{
  title: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  tone?: Tone;
  loading?: boolean;
}>;

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "default",
  loading = false,
}: Props) {
  return (
    <article className="rounded-2xl border border-secondary/15 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            "flex size-10 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-secondary/15",
            toneClasses[tone],
          )}
        >
          <Icon className="size-5" strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-secondary">{title}</p>
          {loading ? (
            <div className="mt-1 h-6 w-20 animate-pulse rounded bg-secondary/15" />
          ) : (
            <p className="mt-0.5 text-3xl font-semibold leading-none text-foreground">
              {formatCount(value)}
            </p>
          )}
          {subtitle ? <p className="mt-0.5 text-xs text-secondary">{subtitle}</p> : null}
        </div>
      </div>
    </article>
  );
}
