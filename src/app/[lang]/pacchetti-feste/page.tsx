import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { getDictionary, hasLocale, type Locale } from "@/lib/dictionaries";
import Container from "@/components/Container";
import PageHero from "@/components/PageHero";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.packages.title,
    description: dict.packages.intro,
    alternates: { canonical: `/${lang}/pacchetti-feste` },
  };
}

export default async function PackagesPage({
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
      <PageHero
        kicker={dict.packages.kicker}
        title={dict.packages.title}
        intro={dict.packages.intro}
      />

      <section className="py-16 sm:py-20">
        <Container className="grid gap-6 lg:grid-cols-3">
          {dict.packages.list.map((pkg) => (
            <div
              key={pkg.name}
              className={`relative flex flex-col rounded-3xl border p-7 ${
                pkg.popular
                  ? "border-momo-orange bg-momo-black text-white shadow-glow-orange"
                  : "border-black/10 bg-white"
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-7 flex items-center gap-1 rounded-full bg-momo-orange px-3 py-1 text-xs font-extrabold text-momo-black">
                  <Sparkles size={14} />
                  {dict.packages.mostPopular}
                </span>
              )}
              <h3
                className={`font-display text-2xl font-extrabold ${
                  pkg.popular ? "text-white" : "text-momo-black"
                }`}
              >
                {pkg.name}
              </h3>
              <p
                className={`mt-1 text-sm ${
                  pkg.popular ? "text-white/70" : "text-momo-black/60"
                }`}
              >
                {pkg.description}
              </p>
              <div className="mt-5 flex items-end gap-1">
                <span className="text-xs font-bold uppercase text-momo-green-500">
                  {dict.packages.priceFrom}
                </span>
                <span
                  className={`font-display text-3xl font-extrabold ${
                    pkg.popular ? "text-momo-orange" : "text-momo-green-700"
                  }`}
                >
                  {pkg.price}
                </span>
                <span
                  className={`text-sm ${
                    pkg.popular ? "text-white/60" : "text-momo-black/50"
                  }`}
                >
                  {dict.packages.perChild}
                </span>
              </div>

              <p
                className={`mt-6 text-xs font-extrabold uppercase tracking-wide ${
                  pkg.popular ? "text-white/60" : "text-momo-black/50"
                }`}
              >
                {dict.packages.includesTitle}
              </p>
              <ul className="mt-3 flex-1 space-y-2.5">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check
                      size={18}
                      className={
                        pkg.popular
                          ? "mt-0.5 shrink-0 text-momo-orange"
                          : "mt-0.5 shrink-0 text-momo-green-500"
                      }
                    />
                    <span
                      className={
                        pkg.popular ? "text-white/85" : "text-momo-black/75"
                      }
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/${locale}/contatti`}
                className={`mt-7 flex items-center justify-center gap-2 rounded-full px-5 py-3 text-center font-extrabold transition-transform hover:scale-105 ${
                  pkg.popular
                    ? "bg-momo-orange text-momo-black"
                    : "bg-momo-black text-white"
                }`}
              >
                {dict.cta.bookNow}
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </Container>
      </section>

      <section className="bg-momo-cream-dim py-14">
        <Container className="grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-momo-black">
              {dict.packages.addOnsTitle}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {dict.packages.addOns.map((extra) => (
                <li
                  key={extra}
                  className="rounded-full bg-white px-4 py-2 text-sm font-bold text-momo-black/80 shadow-sm"
                >
                  {extra}
                </li>
              ))}
            </ul>
          </div>
          <p className="self-end text-sm italic text-momo-black/60">
            {dict.packages.note}
          </p>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-momo-green-900 py-16 text-white sm:py-20">
        <div className="bg-dots absolute inset-0 opacity-30" />
        <Container className="relative flex flex-col items-center gap-6 text-center">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            {dict.packages.ctaTitle}
          </h2>
          <p className="max-w-xl text-white/80">{dict.packages.ctaText}</p>
          <Link
            href={`/${locale}/contatti`}
            className="flex items-center gap-2 rounded-full bg-momo-orange px-6 py-3.5 font-extrabold text-momo-black shadow-glow-orange transition-transform hover:scale-105"
          >
            {dict.cta.bookNow}
            <ArrowRight size={18} />
          </Link>
        </Container>
      </section>
    </>
  );
}
