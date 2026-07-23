import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Coffee, UtensilsCrossed, Gamepad2 } from "lucide-react";
import { getDictionary, hasLocale, type Locale } from "@/lib/dictionaries";
import Container from "@/components/Container";
import PageHero from "@/components/PageHero";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.bar.title, description: dict.bar.intro };
}

export default async function BarPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);

  return (
    <>
      <PageHero kicker={dict.bar.kicker} title={dict.bar.title} intro={dict.bar.intro} />
      <section className="py-16 sm:py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl">
            <Image src="/momopolis/bar.webp" alt="Il bancone del Momòpolis Bar" fill priority sizes="(max-width: 1024px) 100vw, 600px" className="object-cover" />
          </div>
          <div>
            <div className="flex gap-3 text-momo-orange"><Coffee /><UtensilsCrossed /><Gamepad2 /></div>
            <p className="mt-5 text-lg leading-relaxed text-momo-black/75">{dict.bar.body}</p>
            <h2 className="font-display mt-8 text-3xl font-extrabold text-momo-black">{dict.bar.accessibleTitle}</h2>
            <p className="mt-3 text-lg leading-relaxed text-momo-black/75">{dict.bar.accessibleText}</p>
          </div>
        </Container>
      </section>
      <section className="bg-momo-green-900 py-16 text-white sm:py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl font-extrabold">{dict.bar.menuTitle}</h2>
            <p className="mt-4 max-w-xl text-lg text-white/80">{dict.bar.menuText}</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl ring-4 ring-momo-orange/70">
            <Image src="/momopolis/sala.webp" alt="Tavoli del Momòpolis Bar" fill sizes="(max-width: 1024px) 100vw, 600px" className="object-cover" />
          </div>
        </Container>
      </section>
    </>
  );
}
