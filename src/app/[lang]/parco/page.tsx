import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Blocks, BookOpen, Gamepad2, Mountain, Sparkles } from "lucide-react";
import { getDictionary, hasLocale, type Locale } from "@/lib/dictionaries";
import Container from "@/components/Container";
import PageHero from "@/components/PageHero";

const icons = [Sparkles, Mountain, Sparkles, Mountain, Blocks, BookOpen, Sparkles, Gamepad2];

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.park.title, description: dict.park.intro };
}

export default async function ParkPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);

  return (
    <>
      <PageHero kicker={dict.park.kicker} title={dict.park.title} intro={dict.park.intro} />
      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid gap-5 lg:grid-cols-2">
            {["/momopolis/parco-1.webp", "/momopolis/parco-2.webp"].map((src, index) => (
              <div key={src} className="relative aspect-[16/9] overflow-hidden rounded-3xl shadow-xl">
                <Image src={src} alt={`Render del parco giochi Momòpolis, vista ${index + 1}`} fill priority={index === 0} sizes="(max-width: 1024px) 100vw, 600px" className="object-cover" />
              </div>
            ))}
          </div>
          <h2 className="font-display mt-16 text-center text-4xl font-extrabold text-momo-black">{dict.park.gamesTitle}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {dict.park.games.map((game, index) => {
              const Icon = icons[index];
              return (
                <article key={game.title} className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${index % 2 ? "bg-momo-orange" : "bg-momo-green-700"}`}><Icon size={23} /></div>
                  <h3 className="font-display mt-4 text-xl font-extrabold text-momo-black">{game.title}</h3>
                  <p className="mt-2 leading-relaxed text-momo-black/70">{game.text}</p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
