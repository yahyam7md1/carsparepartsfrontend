import nav from "../../messages/en/nav.json";
import hero from "../../messages/en/hero.json";
import home from "../../messages/en/home.json";
import listing from "../../messages/en/listing.json";
import product from "../../messages/en/product.json";
import cart from "../../messages/en/cart.json";
import contact from "../../messages/en/contact.json";
import footer from "../../messages/en/footer.json";
import common from "../../messages/en/common.json";

/** Merged English messages; shape matches Arabic. Used for `IntlMessages` typing. */
export const enMessages = {
  nav,
  hero,
  home,
  listing,
  product,
  cart,
  contact,
  footer,
  common,
} as const;

export type AppMessages = typeof enMessages;
