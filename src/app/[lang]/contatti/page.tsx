import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Clock, Phone, Mail } from "lucide-react";
import { getDictionary, hasLocale, type Locale } from "@/lib/dictionaries";
import { siteConfig } from "@/lib/site-config";
import Container from "@/components/Container";
import PageHero from "@/components/PageHero";
import BookingForm from "@/components/BookingForm";
import MapEmbed from "@/components/MapEmbed";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.contact.title,
    description: dict.contact.intro,
    alternates: { canonical: `/${lang}/contatti` },
  };
}

export default async function ContactPage({
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
        kicker={dict.contact.kicker}
        title={dict.contact.title}
        intro={dict.contact.intro}
      />

      <section className="py-16 sm:py-20">
        <Container className="grid gap-8 lg:grid-cols-3">
          <div className="flex items-start gap-3 rounded-2xl bg-momo-cream-dim p-5">
            <MapPin className="mt-0.5 shrink-0 text-momo-green-700" size={22} />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-momo-black/50">
                {dict.contact.addressTitle}
              </p>
              <p className="mt-1 font-bold text-momo-black">
                {siteConfig.address.street}
                <br />
                {siteConfig.address.zip} {siteConfig.address.city} (
                {siteConfig.address.canton})
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-momo-cream-dim p-5">
            <Clock className="mt-0.5 shrink-0 text-momo-green-700" size={22} />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-momo-black/50">
                {dict.contact.hoursTitle}
              </p>
              <ul className="mt-1 space-y-0.5 text-sm font-bold text-momo-black">
                {siteConfig.openingHours.map((row) => (
                  <li key={row.day.it} className="flex justify-between gap-4">
                    <span>{row.day[locale]}</span>
                    <span className="text-momo-black/60">{row.hours}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-2xl bg-momo-cream-dim p-5">
              <Phone className="shrink-0 text-momo-green-700" size={20} />
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-momo-black/50">
                  {dict.contact.phoneTitle}
                </p>
                <a
                  href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
                  className="font-bold text-momo-black"
                >
                  {siteConfig.phone}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-momo-cream-dim p-5">
              <Mail className="shrink-0 text-momo-green-700" size={20} />
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-momo-black/50">
                  {dict.contact.emailTitle}
                </p>
                <a href={`mailto:${siteConfig.email}`} className="font-bold text-momo-black">
                  {siteConfig.email}
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-16 sm:pb-20">
        <Container>
          <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-10">
            <h2 className="font-display text-2xl font-extrabold text-momo-black sm:text-3xl">
              {dict.contact.formTitle}
            </h2>
            <p className="mt-2 max-w-2xl text-momo-black/70">
              {dict.contact.formIntro}
            </p>
            <div className="mt-8">
              <BookingForm locale={locale} dict={dict} />
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-16 sm:pb-20">
        <Container>
          <h2 className="font-display text-2xl font-extrabold text-momo-black sm:text-3xl">
            {dict.contact.mapTitle}
          </h2>
          <div className="mt-6">
            <MapEmbed dict={dict} />
          </div>
        </Container>
      </section>
    </>
  );
}
