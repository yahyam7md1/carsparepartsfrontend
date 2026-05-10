import { PDP_CARD_SHELL } from "@/shop/components/pdp/cardShell";

type Props = Readonly<{
  title: string;
  description: string | null | undefined;
  emptyLabel: string;
}>;

export function ProductDescriptionCard({ title, description, emptyLabel }: Props) {
  return (
    <section className={`${PDP_CARD_SHELL} p-6 md:p-7`}>
      <h2 className="text-2xl font-semibold tracking-tight text-primary">{title}</h2>
      <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-foreground">
        {description?.trim() || emptyLabel}
      </p>
    </section>
  );
}
