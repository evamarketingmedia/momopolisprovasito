import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { getDictionary, hasLocale, locales, type Locale } from "@/lib/dictionaries";
import { siteConfig } from "@/lib/site-config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import StructuredData from "@/components/StructuredData";
import MapEmbed from "@/components/MapEmbed";
import Container from "@/components/Container";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);

  return {
    metadataBase: new URL(siteConfig.domain),
    title: {
      default: `${siteConfig.name} · ${siteConfig.tagline}`,
      template: `%s · ${siteConfig.name}`,
    },
    description: dict.home.heroSubtitle,
    alternates: {
      canonical: `/${lang}`,
      languages: {
        it: "/it",
        en: "/en",
      },
    },
    openGraph: {
      siteName: siteConfig.name,
      title: `${siteConfig.name} · ${siteConfig.tagline}`,
      description: dict.home.heroSubtitle,
      url: `${siteConfig.domain}/${lang}`,
      locale: lang === "it" ? "it_CH" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteConfig.name} · ${siteConfig.tagline}`,
      description: dict.home.heroSubtitle,
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);

  return (
    <html lang={lang} className={`${baloo.variable} ${nunito.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-momo-cream text-momo-black">
        <StructuredData locale={lang as Locale} />
        <Header locale={lang as Locale} dict={dict} />
        <main className="flex-1">{children}</main>
        <section className="bg-momo-green-neon/10 py-14 sm:py-16">
          <Container>
            <p className="font-display text-sm font-extrabold uppercase tracking-[0.2em] text-momo-orange">
              Momòpolis Mendrisio
            </p>
            <h2 className="font-display mt-2 text-3xl font-extrabold text-momo-black">
              Come raggiungerci
            </h2>
            <p className="mt-2 text-momo-black/65">Via Penate 7, 6500 Mendrisio (Ticino)</p>
            <div className="mt-6">
              <MapEmbed dict={dict} />
            </div>
          </Container>
        </section>
        <Footer locale={lang as Locale} dict={dict} />
        <WhatsAppButton dict={dict} />
      </body>
    </html>
  );
}
