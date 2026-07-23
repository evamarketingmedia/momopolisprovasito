"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { Locale, Dictionary } from "@/lib/dictionaries";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { slug: "", label: dict.nav.home },
    { slug: "chi-siamo", label: dict.nav.about },
    { slug: "galleria", label: dict.nav.gallery },
    { slug: "contatti", label: dict.nav.contact },
  ];

  const isActive = (slug: string) => {
    const href = `/${locale}${slug ? `/${slug}` : ""}`;
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-50 border-b-2 border-momo-green-neon bg-white">
      <div className="flex w-full items-center justify-between gap-4 px-3 py-3 sm:px-4 xl:px-6 2xl:px-10">
        <Link
          href={`/${locale}`}
          className="relative block h-14 w-48 shrink-0 sm:h-16 sm:w-56"
          aria-label="Momòpolis Family Bar & Park"
        >
          <Image
            src="/momopolis/logo-header-originale.webp"
            alt="Momòpolis Family Bar & Park"
            fill
            priority
            sizes="224px"
            className="object-contain object-left"
          />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 xl:flex 2xl:gap-2">
          {navItems.map((item) => (
            <Link
              key={item.slug || "home"}
              href={`/${locale}${item.slug ? `/${item.slug}` : ""}`}
              className={`whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-bold transition-colors 2xl:px-4 ${
                isActive(item.slug)
                  ? "bg-momo-green-700 text-white"
                  : "text-momo-black/75 hover:bg-momo-black/5 hover:text-momo-black"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 xl:flex">
          <LanguageSwitcher locale={locale} />
          <Link
            href={`/${locale}/contatti`}
            className="whitespace-nowrap rounded-full bg-momo-orange px-4 py-2 text-sm font-extrabold text-momo-black shadow-glow-orange transition-transform hover:scale-105"
          >
            {dict.cta.bookNow}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-momo-black/20 p-2 text-momo-black xl:hidden"
          aria-label="Menu"
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-momo-black/10 bg-white px-4 pb-5 pt-2 xl:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.slug || "home"}
                href={`/${locale}${item.slug ? `/${item.slug}` : ""}`}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-3 py-2.5 text-base font-bold ${
                  isActive(item.slug)
                    ? "bg-momo-green-700 text-white"
                    : "text-momo-black/80 hover:bg-momo-black/5"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex items-center justify-between gap-3">
            <LanguageSwitcher locale={locale} />
            <Link
              href={`/${locale}/contatti`}
              onClick={() => setOpen(false)}
              className="rounded-full bg-momo-orange px-4 py-2 text-sm font-extrabold text-momo-black"
            >
              {dict.cta.bookNow}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
