import { PDP_CARD_SHELL } from "@/shop/components/pdp/cardShell";

type SpecRowProps = Readonly<{
  label: string;
  value: string;
}>;

function SpecRow({ label, value }: SpecRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-secondary/12 py-3.5">
      <dt className="text-sm font-medium text-secondary">{label}</dt>
      <dd className="text-right text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}

type Props = Readonly<{
  title: string;
  manufacturerLabel: string;
  dimensionsLabel: string;
  weightLabel: string;
  categoryLabel: string;
  conditionLabel: string;
  oemNumbersLabel: string;
  manufacturer: string | null;
  dimensions: string | null;
  weight: number | null;
  category: string;
  condition: string | null;
  oemValues: string[];
}>;

export function ProductSpecsCard({
  title,
  manufacturerLabel,
  dimensionsLabel,
  weightLabel,
  categoryLabel,
  conditionLabel,
  oemNumbersLabel,
  manufacturer,
  dimensions,
  weight,
  category,
  condition,
  oemValues,
}: Props) {
  const manufacturerValue = manufacturer?.trim() ?? "";
  const dimensionsValue = dimensions?.trim() ?? "";
  const categoryValue = category.trim();
  const conditionValue = condition?.trim() ?? "";
  const hasOems = oemValues.length > 0;
  const rows: Array<{ label: string; value: string }> = [];

  if (manufacturerValue) rows.push({ label: manufacturerLabel, value: manufacturerValue });
  if (dimensionsValue) rows.push({ label: dimensionsLabel, value: dimensionsValue });
  if (weight != null) rows.push({ label: weightLabel, value: `${weight} kg` });
  if (categoryValue) rows.push({ label: categoryLabel, value: categoryValue });
  if (conditionValue) rows.push({ label: conditionLabel, value: conditionValue });

  return (
    <section className={`${PDP_CARD_SHELL} p-6 md:p-7`}>
      <h2 className="text-2xl font-semibold tracking-tight text-primary">{title}</h2>
      {rows.length > 0 ? (
        <dl className="mt-5">
          {rows.map((row) => (
            <SpecRow key={row.label} label={row.label} value={row.value} />
          ))}
        </dl>
      ) : null}

      {hasOems ? (
        <div className={`${rows.length > 0 ? "mt-6 pt-1" : "mt-5"}`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
            {oemNumbersLabel}
          </p>
          <ul className="mt-3 space-y-1">
            {oemValues.map((value) => (
              <li key={value} className="font-mono text-sm text-foreground">
                {value}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
