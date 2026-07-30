"use client";

import Image from "next/image";
import Link from "next/link";
import type { Locale, Dictionary } from "@/lib/dictionaries";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header({ locale }: { locale: Locale; dict: Dictionary }) {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="flex items-center justify-between px-5 py-5 sm:px-8">
        <Link
          href={`/${locale}`}
          className="relative h-16 w-52 rounded-2xl bg-white/95 p-2 shadow-lg backdrop-blur"
          aria-label="Momopolis — torna alla home"
        >
          <Image
            src="/momopolis/logo-header-originale.webp"
            alt="Momopolis Family Bar & Park"
            fill
            priority
            sizes="208px"
            className="object-contain p-2"
          />
        </Link>
        <div className="rounded-full bg-white/95 p-1.5 shadow-lg backdrop-blur">
          <LanguageSwitcher locale={locale} />
        </div>
      </div>
    </header>
  );
}
