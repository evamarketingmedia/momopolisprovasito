import "server-only";
import { type Locale } from "./locales";

export { locales, defaultLocale, hasLocale, type Locale } from "./locales";

const dictionaries = {
  it: () => import("./dictionaries/it").then((m) => m.default),
  en: () => import("./dictionaries/en").then((m) => m.default),
};

export const getDictionary = async (locale: Locale) => dictionaries[locale]();

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
