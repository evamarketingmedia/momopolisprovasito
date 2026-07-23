"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/locales";

function stripLocale(pathname: string, locale: Locale) {
  const rest = pathname.replace(new RegExp(`^/${locale}`), "");
  return rest || "/";
}

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const restOfPath = stripLocale(pathname, locale);

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/5 p-1 text-xs font-bold uppercase tracking-wide">
      {locales.map((l) => {
        const href = `/${l}${restOfPath === "/" ? "" : restOfPath}`;
        const active = l === locale;
        return (
          <Link
            key={l}
            href={href}
            onClick={() => {
              document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000`;
            }}
            aria-current={active ? "true" : undefined}
            className={`rounded-full px-2.5 py-1 transition-colors ${
              active
                ? "bg-momo-orange text-momo-black"
                : "text-white/80 hover:text-white"
            }`}
          >
            {l}
          </Link>
        );
      })}
    </div>
  );
}
