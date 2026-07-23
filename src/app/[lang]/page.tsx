import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Baby,
  Coffee,
  PartyPopper,
  ShieldCheck,
  Clock,
  ArrowRight,
} from "lucide-react";
import { getDictionary, hasLocale, type Locale } from "@/lib/dictionaries";
import { siteConfig } from "@/lib/site-config";
import Container from "@/components/Container";
import { notFound } from "next/navigation";

const highlightIcons = [Baby, Coffee, PartyPopper, ShieldCheck];

// Re-fetch site images periodically so admin edits show up without a redeploy.
export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.home.heroTitle,
    description: dict.home.heroSubtitle,
    alternates: { canonical: `/${lang}` },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = await getDictionary(locale);

  return (
    <>
      {/* HERO */}
      <section className="bg-dots relative overflow-hidden bg-white">
        <Container className="relative grid items-center gap-10 pb-24 pt-16 sm:pb-28 sm:pt-24 lg:grid-cols-2 lg:pt-28">
          <div>
            <div className="inline-flex animate-momo-wiggle items-center gap-1.5 rounded-full bg-momo-green-neon px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-momo-black">
              {dict.home.heroBadge}
            </div>
            <p className="font-display mt-4 text-sm font-bold uppercase tracking-[0.2em] text-momo-orange">
              {dict.home.heroKicker}
            </p>
            <h1 className="font-display mt-4 text-4xl font-extrabold leading-[1.05] text-momo-black sm:text-5xl lg:text-6xl">
              {dict.home.heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-momo-black/70">
              {dict.home.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={`/${locale}/contatti`}
                className="rounded-full bg-momo-orange px-6 py-3.5 text-base font-extrabold text-momo-black shadow-glow-orange transition-transform hover:scale-105"
              >
                {dict.home.heroCta1}
              </Link>
              <Link
                href={`/${locale}/galleria`}
                className="rounded-full border-2 border-momo-black/25 px-6 py-3.5 text-base font-extrabold text-momo-black transition-colors hover:border-momo-green-700 hover:text-momo-green-700"
              >
                {dict.home.heroCta2}
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative mt-8 aspect-[3/4] overflow-hidden rounded-3xl ring-4 ring-momo-orange/50">
                <Image
                  src="/momopolis/ingresso.webp"
                  alt="Ingresso di Momòpolis Family Bar & Park"
                  fill
                  sizes="(max-width: 1024px) 45vw, 300px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl ring-4 ring-momo-green-neon/50">
                <Image
                  src="/momopolis/parco-2.webp"
                  alt="Vista del parco giochi indoor Momòpolis"
                  fill
                  sizes="(max-width: 1024px) 45vw, 300px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </Container>
        <svg
          className="absolute inset-x-0 bottom-0 h-10 w-full sm:h-14"
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,32 C200,64 400,0 600,24 C800,48 1000,8 1200,32 L1200,60 L0,60 Z"
            className="momo-wave-fill"
          />
        </svg>
      </section>

      {/* MAIN DESTINATIONS */}
      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-extrabold text-momo-black sm:text-4xl">
              {locale === "it" ? "Scopri Momòpolis" : "Discover Momòpolis"}
            </h2>
            <p className="mt-3 text-lg text-momo-black/65">
              {locale === "it"
                ? "Scegli l’area che vuoi esplorare."
                : "Choose the area you would like to explore."}
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href={`/${locale}/bar`}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition-transform hover:-translate-y-1"
            >
              <Image
                src="/momopolis/logo-bar.webp"
                alt={dict.nav.bar}
                fill
                sizes="(max-width: 640px) 90vw, 280px"
                className="object-cover"
              />
              <span className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-sm bg-white px-4 py-3 text-center font-extrabold text-momo-black shadow-lg">
                {locale === "it" ? "Entra" : "Enter"}
              </span>
              <strong className="absolute inset-x-0 bottom-0 bg-momo-orange px-4 py-4 text-center text-xl text-white">
                {dict.nav.bar}
              </strong>
            </Link>

            <Link
              href={`/${locale}/parco`}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition-transform hover:-translate-y-1"
            >
              <Image
                src="/momopolis/logo-parco.webp"
                alt={dict.nav.park}
                fill
                sizes="(max-width: 640px) 90vw, 280px"
                className="object-cover"
              />
              <span className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-sm bg-white px-4 py-3 text-center font-extrabold text-momo-black shadow-lg">
                {locale === "it" ? "Entra" : "Enter"}
              </span>
              <strong className="absolute inset-x-0 bottom-0 bg-momo-green-700 px-4 py-4 text-center text-xl text-white">
                {dict.nav.park}
              </strong>
            </Link>

            <Link
              href={`/${locale}/eventi`}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-momo-orange shadow-sm transition-transform hover:-translate-y-1"
            >
              <Image
                src="/momopolis/sala.webp"
                alt={dict.nav.events}
                fill
                sizes="(max-width: 640px) 90vw, 280px"
                className="object-cover opacity-35 mix-blend-multiply"
              />
              <span className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-sm bg-white px-4 py-3 text-center font-extrabold text-momo-black shadow-lg">
                {locale === "it" ? "Entra" : "Enter"}
              </span>
              <strong className="absolute inset-x-0 bottom-0 px-4 py-4 text-center text-xl text-white">
                {dict.nav.events}
              </strong>
            </Link>

            <Link
              href={`/${locale}/pacchetti-feste`}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-momo-green-700 shadow-sm transition-transform hover:-translate-y-1"
            >
              <Image
                src="/momopolis/parco-2.webp"
                alt={dict.nav.packages}
                fill
                sizes="(max-width: 640px) 90vw, 280px"
                className="object-cover opacity-35 mix-blend-multiply"
              />
              <span className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-sm bg-white px-4 py-3 text-center font-extrabold text-momo-black shadow-lg">
                {locale === "it" ? "Entra" : "Enter"}
              </span>
              <strong className="absolute inset-x-0 bottom-0 px-4 py-4 text-center text-xl text-white">
                {dict.nav.packages}
              </strong>
            </Link>
          </div>
        </Container>
      </section>

      {/* INTRO */}
      <section className="py-16 sm:py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image
              src="/momopolis/sala.webp"
              alt="Sala del Momòpolis Bar"
              fill
              sizes="(max-width: 1024px) 100vw, 500px"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-display text-3xl font-extrabold text-momo-black sm:text-4xl">
              {dict.home.introTitle}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-momo-black/75">
              {dict.home.introText}
            </p>
          </div>
        </Container>
      </section>

      {/* HIGHLIGHTS */}
      <section className="bg-momo-cream-dim py-16 sm:py-20">
        <Container>
          <h2 className="font-display text-center text-3xl font-extrabold text-momo-black sm:text-4xl">
            {dict.home.highlightsTitle}
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {dict.home.highlights.map((item, i) => {
              const Icon = highlightIcons[i % highlightIcons.length];
              const iconBg = i % 2 === 0 ? "bg-momo-green-700" : "bg-momo-orange";
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${iconBg}`}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="font-display mt-4 text-lg font-extrabold text-momo-black">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-momo-black/70">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ZONES */}
      <section className="py-16 sm:py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <h2 className="font-display text-3xl font-extrabold text-momo-black sm:text-4xl">
              {dict.home.zonesTitle}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-momo-black/75">
              {dict.home.zonesText}
            </p>
            <Link
              href={`/${locale}/galleria`}
              className="mt-6 inline-flex items-center gap-2 font-extrabold text-momo-green-700 hover:text-momo-green-500"
            >
              {dict.cta.seePhotos}
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="order-1 grid grid-cols-3 gap-3 lg:order-2">
            {["/momopolis/parco-1.webp", "/momopolis/parco-2.webp", "/momopolis/bar.webp"].map((url, i) => (
              <div
                key={url}
                className={`relative aspect-square overflow-hidden rounded-2xl ${
                  i === 1 ? "translate-y-4" : ""
                }`}
              >
                <Image
                  src={url}
                  alt={i < 2 ? "Render del parco giochi Momòpolis" : "Render del Momòpolis Bar"}
                  fill
                  sizes="150px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* PARTY TEASER */}
      <section className="relative overflow-hidden bg-momo-green-900 py-16 text-white sm:py-20">
        <div className="bg-dots absolute inset-0 opacity-40" />
        <Container className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
              {dict.home.partyTeaserTitle}
            </h2>
            <p className="mt-4 text-lg text-white/80">
              {dict.home.partyTeaserText}
            </p>
          </div>
          <Link
            href={`/${locale}/pacchetti-feste`}
            className="flex shrink-0 items-center gap-2 rounded-full bg-momo-orange px-6 py-3.5 text-base font-extrabold text-momo-black shadow-glow-orange transition-transform hover:scale-105"
          >
            {dict.cta.viewPackages}
            <ArrowRight size={18} />
          </Link>
        </Container>
      </section>

      {/* HOURS + MAP TEASER */}
      <section className="py-16 sm:py-20">
        <Container className="grid gap-8 rounded-3xl bg-momo-cream-dim p-8 sm:p-10 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 text-momo-green-700">
              <Clock size={22} />
              <h3 className="font-display text-2xl font-extrabold text-momo-black">
                {dict.home.hoursTitle}
              </h3>
            </div>
            <ul className="mt-5 space-y-2 text-momo-black/80">
              {siteConfig.openingHours.map((row) => (
                <li
                  key={row.day.it}
                  className="flex items-center justify-between border-b border-black/5 py-2 text-sm sm:text-base"
                >
                  <span className="font-bold">{row.day[locale]}</span>
                  <span>{row.hours}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-center gap-4">
            <h3 className="font-display text-2xl font-extrabold text-momo-black">
              {dict.home.mapTitle}
            </h3>
            <p className="text-momo-black/70">
              {siteConfig.address.street}, {siteConfig.address.zip}{" "}
              {siteConfig.address.city}
            </p>
            <Link
              href={`/${locale}/contatti`}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-momo-black px-5 py-3 font-extrabold text-white transition-transform hover:scale-105"
            >
              {dict.cta.getDirections}
              <ArrowRight size={18} />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
