import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cake, GraduationCap, Building2, PartyPopper, ArrowRight } from "lucide-react";
import { getDictionary, hasLocale, type Locale } from "@/lib/dictionaries";
import { withSize } from "@/data/gallery";
import { getSiteImages } from "@/lib/site-images-store";
import Container from "@/components/Container";
import PageHero from "@/components/PageHero";

const eventIcons = [Cake, GraduationCap, Building2, PartyPopper];

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
    title: dict.events.title,
    description: dict.events.intro,
    alternates: { canonical: `/${lang}/eventi` },
  };
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = await getDictionary(locale);
  const siteImages = await getSiteImages();
  const eventImages = [
    siteImages.eventBirthday,
    siteImages.eventClass,
    siteImages.eventCorporate,
    siteImages.eventThemed,
  ];

  return (
    <>
      <PageHero
        kicker={dict.events.kicker}
        title={dict.events.title}
        intro={dict.events.intro}
      />

      <section className="py-16 sm:py-20">
        <Container className="grid gap-6 sm:grid-cols-2">
          {dict.events.items.map((item, i) => {
            const Icon = eventIcons[i % eventIcons.length];
            const img = eventImages[i % eventImages.length];
            return (
              <div
                key={item.title}
                className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={withSize(img, 700, 400)}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-white ${
                      i % 2 === 0 ? "bg-momo-green-700" : "bg-momo-orange"
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 className="font-display mt-4 text-xl font-extrabold text-momo-black">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-momo-black/70">{item.text}</p>
                </div>
              </div>
            );
          })}
        </Container>
      </section>

      <section className="relative overflow-hidden bg-momo-black py-16 text-white sm:py-20">
        <div className="bg-dots absolute inset-0 opacity-30" />
        <Container className="relative flex flex-col items-start gap-6 text-center sm:items-center">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            {dict.events.ctaTitle}
          </h2>
          <p className="max-w-xl text-white/75">{dict.events.ctaText}</p>
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
