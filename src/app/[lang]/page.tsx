import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgePercent, CakeSlice, Coffee, Trees } from "lucide-react";
import { getDictionary, hasLocale, type Locale } from "@/lib/dictionaries";

const cards = [
  { slug: "parco", label: "Il parco", icon: Trees, image: "/momopolis/parco-2.webp", tone: "from-momo-green-neon/95" },
  { slug: "bar", label: "Il bar", icon: Coffee, image: "/momopolis/bar.webp", tone: "from-momo-orange/95" },
  { slug: "pacchetti-feste", label: "Compleanni & eventi", icon: CakeSlice, image: "/momopolis/sala.webp", tone: "from-momo-orange/95" },
  { slug: "eventi", label: "Promozioni", icon: BadgePercent, image: "/momopolis/ingresso.webp", tone: "from-momo-green-neon/95" },
];

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const isItalian = lang === "it";
  return {
    title: isItalian
      ? "Parco giochi indoor e Family Bar a Mendrisio"
      : "Indoor playground and Family Bar in Mendrisio",
    description: isItalian
      ? "Momòpolis è il parco giochi indoor con Family Bar a Mendrisio, Ticino: giochi per bambini, feste di compleanno ed eventi vicino a Como e Varese."
      : "Momòpolis is an indoor playground and Family Bar in Mendrisio, Ticino, with children's parties and events near Como and Varese.",
  };
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const locale = lang as Locale;
  await getDictionary(locale);

  return (
    <section className="portal-home relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(166,255,0,.22),transparent_52%)]" />

      <div className="relative space-y-3 px-3 pb-6 pt-4 sm:hidden">
        <Link
          href={`/${locale}/chi-siamo`}
          className="flex items-center justify-between rounded-3xl border-2 border-momo-green-neon bg-white px-5 py-4 shadow-md"
        >
          <span className="relative h-16 w-40">
            <Image src="/momopolis/logo-header-originale.webp" alt="Momòpolis Family Bar & Park" fill sizes="160px" className="object-contain object-left" priority />
          </span>
          <span className="font-display rounded-full bg-momo-orange px-4 py-2 text-sm font-extrabold text-momo-black">
            Chi siamo
          </span>
        </Link>
        {cards.map(({ slug, label, icon: Icon, image, tone }) => (
          <Link
            key={`mobile-${slug}`}
            href={`/${locale}/${slug}`}
            className="group relative block h-44 overflow-hidden rounded-3xl border-2 border-momo-green-neon/40 shadow-md"
          >
            <Image src={image} alt="" fill sizes="100vw" className="object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-t ${tone} via-white/5 to-transparent`} />
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-5 text-momo-black">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white shadow">
                <Icon size={20} />
              </span>
              <span className="font-display text-xl font-extrabold">{label}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="relative mx-auto hidden min-h-screen max-w-7xl grid-cols-2 grid-rows-2 gap-4 p-4 sm:grid">
        {cards.map(({ slug, label, icon: Icon, image, tone }) => (
          <Link
            key={slug}
            href={`/${locale}/${slug}`}
            className="group relative overflow-hidden rounded-[1.75rem] border-2 border-momo-green-neon/40 shadow-lg"
          >
            <Image src={image} alt="" fill sizes="50vw" priority={slug === "parco"} className="object-cover transition duration-700 group-hover:scale-105" />
            <div className={`absolute inset-0 bg-gradient-to-t ${tone} via-white/5 to-transparent`} />
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-5 text-momo-black sm:p-8">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-momo-black shadow-lg">
                <Icon size={22} />
              </span>
              <span className="font-display text-xl font-extrabold sm:text-3xl">{label}</span>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href={`/${locale}/chi-siamo`}
        aria-label="Chi siamo — Momopolis"
        className="group absolute left-1/2 top-1/2 z-20 hidden h-52 w-52 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-[6px] border-momo-green-neon bg-white p-4 shadow-[0_0_0_12px_rgba(255,255,255,.9),0_20px_60px_rgba(14,166,91,.28)] transition hover:scale-105 sm:flex"
      >
        <span className="relative block h-20 w-full sm:h-28">
          <Image
            src="/momopolis/logo-header-originale.webp"
            alt="Momopolis"
            fill
            sizes="160px"
            className="object-contain"
            priority
          />
        </span>
        <span className="font-display mt-1 rounded-full bg-momo-orange px-4 py-1 text-sm font-extrabold text-momo-black transition-colors group-hover:bg-momo-green-neon sm:text-base">
          Chi siamo
        </span>
      </Link>
    </section>
  );
}
