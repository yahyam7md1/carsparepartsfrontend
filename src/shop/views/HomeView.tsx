"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ShopLocaleToggle } from "@/shop/components/ShopLocaleToggle";

export function HomeView() {
  const t = useTranslations("common");
  const tn = useTranslations("nav");

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-3xl">
        <div className="flex flex-col gap-4 items-center sm:items-start w-full">
          <p className="text-primary text-sm font-medium">{tn("brand")}</p>
          <ShopLocaleToggle />
        </div>

        <Image
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left rtl:text-right">
          <li className="mb-2 tracking-[-.01em]">
            {t("starterShellHint")}{" "}
            <code className="rounded bg-secondary/15 font-mono font-semibold px-1 py-0.5 text-foreground">
              {t("starterFileHomeView")}
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            {t("starterRouteHint")}{" "}
            <code className="rounded bg-secondary/15 font-mono font-semibold px-1 py-0.5 text-foreground">
              {t("starterFileShopPage")}
            </code>
            .
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-primary text-white gap-2 hover:opacity-90 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/vercel.svg"
              alt=""
              width={20}
              height={20}
            />
            {t("starterLinkDeploy")}
          </a>
          <a
            className="flex h-10 w-full items-center justify-center rounded-full border border-solid border-secondary/30 px-4 font-medium transition-colors hover:border-transparent hover:bg-secondary/10 sm:h-12 sm:w-auto sm:px-5 sm:text-base md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("starterLinkReadDocs")}
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <ShopLocaleToggle className="justify-center w-full sm:w-auto" />
        <div className="flex gap-[24px] flex-wrap items-center justify-center w-full sm:w-auto">
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/file.svg"
              alt=""
              width={16}
              height={16}
            />
            {t("starterFooterLearn")}
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/window.svg"
              alt=""
              width={16}
              height={16}
            />
            {t("starterFooterExamples")}
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/globe.svg"
              alt=""
              width={16}
              height={16}
            />
            {t("starterFooterNextSite")}
          </a>
        </div>
      </footer>
    </div>
  );
}
