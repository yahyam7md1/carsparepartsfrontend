import { setRequestLocale } from "next-intl/server";
import { ContactView } from "@/shop/views/ContactView";

type Props = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ContactView />;
}
