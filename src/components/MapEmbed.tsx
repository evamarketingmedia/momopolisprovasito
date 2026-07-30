import { Navigation } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import type { Dictionary } from "@/lib/dictionaries";

export default function MapEmbed({ dict }: { dict: Dictionary }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-black/10">
      <div className="aspect-[4/3] w-full sm:aspect-video">
        <iframe
          title="Momopolis — Google Maps"
          src={siteConfig.mapsEmbedSrc}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <a
        href={siteConfig.mapsDirectionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-momo-orange px-5 py-4 text-sm font-extrabold text-momo-black transition-colors hover:bg-momo-green-neon"
      >
        <Navigation size={16} />
        {dict.cta.getDirections}
      </a>
    </div>
  );
}
