export type Locale = "it" | "en";

export const locales: Locale[] = ["it", "en"];
export const defaultLocale: Locale = "it";

export const hasLocale = (locale: string): locale is Locale =>
  (locales as string[]).includes(locale);
