import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getSiteImages } from "@/lib/site-images-store";
import { getGalleryImages } from "@/lib/gallery-store";
import { withSize } from "@/data/gallery";
import type { GalleryCategory } from "@/data/gallery";
import {
  updateSiteImage,
  addGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
} from "./actions";

export const metadata: Metadata = {
  title: "Dashboard · Momopolis Admin",
  robots: { index: false, follow: false },
};

const SITE_IMAGE_LABELS: Record<string, string> = {
  heroSlide: "Home — Hero, foto 1 (scivolo)",
  heroJump: "Home — Hero, foto 2 (salto)",
  aboutStory: "Chi siamo — La nostra storia",
  aboutTeam: "Chi siamo — Il team",
  zonesA: "Home — Collage parco giochi 1",
  zonesB: "Home — Collage parco giochi 2",
  zonesC: "Home — Collage parco giochi 3",
  eventBirthday: "Eventi — Feste di compleanno",
  eventClass: "Eventi — Feste di classe",
  eventCorporate: "Eventi — Eventi aziendali",
  eventThemed: "Eventi — Serate a tema",
};

const CATEGORY_LABELS: Record<GalleryCategory, string> = {
  playground: "Parco giochi",
  parties: "Feste",
  events: "Eventi speciali",
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-momo-cream p-8">
        <div className="mx-auto max-w-lg rounded-2xl border border-black/10 bg-white p-8 text-center">
          <h1 className="font-display text-xl font-extrabold text-momo-black">
            Supabase non configurato
          </h1>
          <p className="mt-3 text-momo-black/70">
            Imposta <code className="rounded bg-black/5 px-1.5 py-0.5">SUPABASE_URL</code> e{" "}
            <code className="rounded bg-black/5 px-1.5 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
            in <code className="rounded bg-black/5 px-1.5 py-0.5">.env.local</code> per gestire
            le foto da qui.
          </p>
        </div>
      </div>
    );
  }

  const { saved } = await searchParams;
  const [siteImages, galleryImages] = await Promise.all([
    getSiteImages(),
    getGalleryImages(),
  ]);

  const byCategory = (cat: GalleryCategory) =>
    galleryImages.filter((img) => img.category === cat);

  return (
    <div className="min-h-screen bg-momo-cream pb-24">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {saved && (
          <div className="mb-8 rounded-xl bg-momo-green-700/10 px-4 py-3 text-sm font-bold text-momo-green-700">
            Modifica salvata.
          </div>
        )}

        {/* SITE IMAGES */}
        <section>
          <h2 className="font-display text-2xl font-extrabold text-momo-black">
            Foto del sito
          </h2>
          <p className="mt-1 text-sm text-momo-black/60">
            Le foto usate in home, chi siamo ed eventi. Le modifiche compaiono sul sito entro
            pochi secondi.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(SITE_IMAGE_LABELS).map(([key, label]) => (
              <div
                key={key}
                className="overflow-hidden rounded-2xl border border-black/10 bg-white"
              >
                <div className="relative aspect-video w-full bg-black/5">
                  <Image
                    src={withSize(siteImages[key as keyof typeof siteImages], 400, 240)}
                    alt=""
                    fill
                    sizes="300px"
                    className="object-cover"
                  />
                </div>
                <form action={updateSiteImage} className="space-y-2 p-4">
                  <input type="hidden" name="key" value={key} />
                  <p className="text-xs font-extrabold uppercase tracking-wide text-momo-black/50">
                    {label}
                  </p>
                  <input
                    type="url"
                    name="url"
                    required
                    defaultValue={siteImages[key as keyof typeof siteImages]}
                    className="momo-input text-xs"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-full bg-momo-black py-2 text-xs font-extrabold text-white hover:bg-momo-green-900"
                  >
                    Salva
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>

        {/* GALLERY */}
        <section className="mt-14">
          <h2 className="font-display text-2xl font-extrabold text-momo-black">
            Galleria
          </h2>
          <p className="mt-1 text-sm text-momo-black/60">
            Foto mostrate nella pagina Galleria del sito, divise per categoria.
          </p>

          <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
            <h3 className="font-display text-sm font-extrabold uppercase tracking-wide text-momo-black/60">
              Aggiungi una foto
            </h3>
            <form
              action={addGalleryImage}
              className="mt-3 grid gap-3 sm:grid-cols-[140px_1fr_100px_auto]"
            >
              <select name="category" required className="momo-input" defaultValue="playground">
                <option value="playground">Parco giochi</option>
                <option value="parties">Feste</option>
                <option value="events">Eventi speciali</option>
              </select>
              <input
                type="url"
                name="url"
                required
                placeholder="https://..."
                className="momo-input"
              />
              <input
                type="number"
                name="sort_order"
                placeholder="Ordine"
                defaultValue={galleryImages.length + 1}
                className="momo-input"
              />
              <button
                type="submit"
                className="rounded-full bg-momo-orange px-5 py-2.5 text-sm font-extrabold text-momo-black hover:scale-105"
              >
                Aggiungi
              </button>
            </form>
          </div>

          {(["playground", "parties", "events"] as GalleryCategory[]).map((cat) => (
            <div key={cat} className="mt-8">
              <h3 className="font-display text-lg font-extrabold text-momo-black">
                {CATEGORY_LABELS[cat]}{" "}
                <span className="text-sm font-normal text-momo-black/40">
                  ({byCategory(cat).length})
                </span>
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {byCategory(cat).map((img) => (
                  <div
                    key={img.id}
                    className="overflow-hidden rounded-2xl border border-black/10 bg-white"
                  >
                    <div className="relative aspect-square w-full bg-black/5">
                      <Image
                        src={withSize(img.url, 300, 300)}
                        alt=""
                        fill
                        sizes="250px"
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-2 p-3">
                      <form action={updateGalleryImage} className="flex gap-1.5">
                        <input type="hidden" name="id" value={img.id} />
                        <input
                          type="url"
                          name="url"
                          required
                          defaultValue={img.url}
                          className="momo-input text-xs"
                        />
                        <button
                          type="submit"
                          className="shrink-0 rounded-full bg-momo-black px-3 text-xs font-extrabold text-white"
                        >
                          Salva
                        </button>
                      </form>
                      <form action={deleteGalleryImage}>
                        <input type="hidden" name="id" value={img.id} />
                        <button
                          type="submit"
                          className="w-full rounded-full border border-red-200 py-1.5 text-xs font-extrabold text-red-600 hover:bg-red-50"
                        >
                          Elimina
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
                {byCategory(cat).length === 0 && (
                  <p className="text-sm text-momo-black/50">Nessuna foto in questa categoria.</p>
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
