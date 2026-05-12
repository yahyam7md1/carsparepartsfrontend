import Script from "next/script";

function readGtmId(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_GTM_ID?.trim();
  if (!raw) return undefined;
  if (!/^GTM-[A-Z0-9]+$/.test(raw)) {
    console.warn(
      `[GoogleTagManager] Ignoring NEXT_PUBLIC_GTM_ID — expected format GTM-XXXXXXX, got "${raw}".`,
    );
    return undefined;
  }
  return raw;
}

/**
 * Google Tag Manager — only mount under `src/app/[locale]/layout.tsx` so `/admin/*` is excluded.
 * Set `NEXT_PUBLIC_GTM_ID` (e.g. `GTM-NW7G5JKM`) in the deployment environment.
 */
export function GoogleTagManager() {
  const gtmId = readGtmId();
  if (!gtmId) return null;

  const snippet = `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');
`;

  return (
    <>
      {/* `beforeInteractive` is valid for App Router; eslint rule targets legacy `pages/_document`. */}
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
      <Script id="google-tag-manager" strategy="beforeInteractive">
        {snippet}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}
