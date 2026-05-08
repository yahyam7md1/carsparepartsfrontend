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
    <article className="rounded-2xl border border-secondary/20 bg-white p-4 shadow-[0_6px_14px_rgba(15,23,42,0.08)] sm:p-5 lg:p-6">
      <div className="flex items-center gap-4 sm:gap-5 lg:gap-6">
        <div
          className={clsx(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-secondary/20 shadow-[0_2px_6px_rgba(15,23,42,0.10)] sm:h-14 sm:w-14 sm:rounded-2xl lg:h-16 lg:w-16",
            toneClasses[tone],
          )}
        >
          <Icon
            className="h-6 w-6 text-primary sm:h-7 sm:w-7 lg:h-8 lg:w-8"
            strokeWidth={2.15}
          />
        </div>
        <div className="flex min-w-0 flex-col justify-center">
          {loading ? (
            <div className="h-7 w-20 animate-pulse rounded bg-secondary/15 sm:h-8 sm:w-24" />
          ) : (
            <p className="text-2xl font-semibold font-mono leading-none text-primary sm:text-3xl">
              {formatCount(value)}
            </p>
          )}
          <p className="mt-1 text-xs font-medium leading-snug text-secondary sm:mt-1.5 sm:text-sm sm:leading-none">
            {title}
          </p>
          {subtitle ? <p className="mt-0.5 text-[11px] text-secondary">{subtitle}</p> : null}
        </div>
      </div>
    </article>
  );
}
