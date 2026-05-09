import Image from "next/image";
import { getTranslations } from "next-intl/server";
import heroPhoto from "@/shop/assets/hero.jpg";
import { HeroInteractive } from "@/shop/components/home/hero/HeroInteractive";

export async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section className="relative flex min-h-[max(34rem,84vh)] flex-col overflow-hidden md:min-h-[max(42rem,88vh)]">
      <Image
        alt={t("heroImageAlt")}
        className="object-cover"
        fill
        priority
        sizes="100vw"
        src={heroPhoto}
      />
      {/* Slightly lighter overlay so more of the photo reads through, like the target */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-primary/78 via-primary/72 to-primary/80"
      />
      {/* Dark vignette on edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] shadow-[inset_0_0_80px_rgba(0,0,0,0.55),inset_0_0_180px_rgba(0,0,0,0.45)]"
      />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center px-4 py-14 md:px-6 md:py-16 lg:py-20">
        <header className="max-w-3xl text-center">
          <h1 className="text-4xl font-bold leading-[1.05] tracking-wide text-white uppercase sm:text-5xl md:text-6xl md:leading-[1.05] lg:text-[3.75rem]">
            <span className="block">{t("heroTitleLine1")}</span>
            <span className="block">{t("heroTitleLine2")}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/92 md:mt-6 md:text-lg">
            {t("heroSubtitle")}
          </p>
        </header>
        <div className="mt-10 w-full flex-1 md:mt-12">
          <HeroInteractive />
        </div>
      </div>
    </section>
  );
}
