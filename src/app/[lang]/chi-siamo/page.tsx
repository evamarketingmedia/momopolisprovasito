import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ShieldCheck, Heart, Sparkles, PartyPopper } from "lucide-react";
import { getDictionary, hasLocale, type Locale } from "@/lib/dictionaries";
import Container from "@/components/Container";
import PageHero from "@/components/PageHero";

const valueIcons = [ShieldCheck, Heart, Sparkles, PartyPopper];

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
    title: dict.about.title,
    description: dict.about.intro,
    alternates: { canonical: `/${lang}/chi-siamo` },
  };
}

export default async function AboutPage({
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
        kicker={dict.about.kicker}
        title={dict.about.title}
        intro={dict.about.intro}
      />

      <section className="py-16 sm:py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <h2 className="font-display text-3xl font-extrabold text-momo-black">
              {dict.about.storyTitle}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-momo-black/75">
              {dict.about.storyText}
            </p>
          </div>
          <div className="relative order-1 aspect-[4/3] overflow-hidden rounded-3xl lg:order-2">
            <Image
              src="/momopolis/ingresso.webp"
              alt="Ingresso di Momòpolis Family Bar & Park"
              fill
              sizes="(max-width: 1024px) 100vw, 500px"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      <section className="bg-momo-green-900 py-16 text-white sm:py-20">
        <Container className="text-center">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            {dict.about.missionTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            {dict.about.missionText}
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <h2 className="font-display text-center text-3xl font-extrabold text-momo-black sm:text-4xl">
            {dict.about.valuesTitle}
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {dict.about.values.map((value, i) => {
              const Icon = valueIcons[i % valueIcons.length];
              return (
                <div
                  key={value.title}
                  className="rounded-2xl border border-black/5 bg-momo-cream-dim p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-momo-orange text-momo-black">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-display mt-4 text-lg font-extrabold text-momo-black">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-momo-black/70">
                    {value.text}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="pb-16 sm:pb-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image
              src="/momopolis/sala.webp"
              alt="La sala accogliente di Momòpolis"
              fill
              sizes="(max-width: 1024px) 100vw, 500px"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-display text-3xl font-extrabold text-momo-black">
              {dict.about.teamTitle}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-momo-black/75">
              {dict.about.teamText}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
