import { redirect } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

type Props = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function LocaleIndexPage({ params }: Props) {
  const { locale } = await params;
  redirect({ href: "/shop", locale: locale as AppLocale });
}
