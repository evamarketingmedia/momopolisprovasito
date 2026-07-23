import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "@/lib/dictionaries";
import { getGalleryImages } from "@/lib/gallery-store";
import Container from "@/components/Container";
import PageHero from "@/components/PageHero";
import Gallery from "@/components/Gallery";

// Re-fetch from Supabase periodically so photo edits made in the dashboard
// show up without a redeploy, while still benefiting from static caching.
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
    title: dict.gallery.title,
    description: dict.gallery.intro,
    alternates: { canonical: `/${lang}/galleria` },
  };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = await getDictionary(locale);
  const images = await getGalleryImages();

  return (
    <>
      <PageHero
        kicker={dict.gallery.kicker}
        title={dict.gallery.title}
        intro={dict.gallery.intro}
      />
      <section className="py-16 sm:py-20">
        <Container>
          <Gallery dict={dict} images={images} />
        </Container>
      </section>
    </>
  );
}
