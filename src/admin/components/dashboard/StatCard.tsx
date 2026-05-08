import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

type Tone = "default" | "warning" | "danger" | "accent";

const toneClasses: Record<Tone, string> = {
  default: "bg-secondary/15",
  warning: "bg-secondary/15",
  danger: "bg-secondary/15",
  accent: "bg-secondary/15",
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
    <article className="rounded-2xl border border-secondary/20 bg-white p-6 shadow-[0_6px_14px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-6">
        <div
          className={clsx(
            "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-secondary/20 shadow-[0_2px_6px_rgba(15,23,42,0.10)]",
            toneClasses[tone],
          )}
        >
          <Icon className="h-8 w-8 text-primary" strokeWidth={2.15} />
        </div>
        <div className="flex min-w-0 flex-col justify-center">
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded bg-secondary/15" />
          ) : (
            <p className="text-3xl font-semibold font-mono leading-none text-primary">
              {formatCount(value)}
            </p>
          )}
          <p className="mt-1.5 text-sm font-medium leading-none text-secondary">{title}</p>
          {subtitle ? <p className="mt-0.5 text-[11px] text-secondary">{subtitle}</p> : null}
        </div>
      </div>
    </article>
  );
}
