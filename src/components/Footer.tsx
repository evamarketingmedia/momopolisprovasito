import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import type { Locale, Dictionary } from "@/lib/dictionaries";
import { siteConfig } from "@/lib/site-config";

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function Footer({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const navItems = [
    { slug: "", label: dict.nav.home },
    { slug: "chi-siamo", label: dict.nav.about },
    { slug: "galleria", label: dict.nav.gallery },
    { slug: "eventi", label: dict.nav.events },
    { slug: "pacchetti-feste", label: dict.nav.packages },
    { slug: "contatti", label: dict.nav.contact },
  ];

  return (
    <footer className="border-t-4 border-momo-green-neon bg-white text-momo-black/75">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-2xl font-extrabold text-momo-orange">
            Momòpolis
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed">
            {dict.footer.tagline}
          </p>
          <div className="mt-5 flex gap-3">
            <span
              aria-label="Instagram"
              aria-disabled="true"
              className="flex h-10 w-10 cursor-default items-center justify-center rounded-full border-2 border-momo-green-neon bg-momo-green-neon/15 text-momo-black/55"
            >
              <InstagramIcon />
            </span>
            <span
              aria-label="Facebook"
              aria-disabled="true"
              className="flex h-10 w-10 cursor-default items-center justify-center rounded-full border-2 border-momo-orange bg-momo-orange/10 text-momo-black/55"
            >
              <FacebookIcon />
            </span>
          </div>
        </div>

        <div>
          <h3 className="font-display text-sm font-extrabold uppercase tracking-wide text-momo-orange">
            {dict.footer.quickLinks}
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {navItems.map((item) => (
              <li key={item.slug || "home"}>
                <Link
                  href={`/${locale}${item.slug ? `/${item.slug}` : ""}`}
                  className="transition-colors hover:text-momo-green-700"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-extrabold uppercase tracking-wide text-momo-orange">
            {dict.footer.contactTitle}
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-momo-green-700" />
              <span>
                {siteConfig.address.street}
                <br />
                {siteConfig.address.zip} {siteConfig.address.city} (
                {siteConfig.address.canton})
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="shrink-0 text-momo-green-700" />
              <a href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}>
                {siteConfig.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="shrink-0 text-momo-green-700" />
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-momo-orange/30 bg-momo-orange/10 px-4 py-5 text-center text-xs text-momo-black/55 sm:px-6">
        © {new Date().getFullYear()} Momòpolis. {dict.footer.rights}
      </div>
    </footer>
  );
}
