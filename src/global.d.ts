import type { AppMessages } from "./i18n/messages";

declare global {
  // Merges with next-intl's `IntlMessages`; must be an interface for ambient merging.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IntlMessages extends AppMessages {}
}

export {};
