"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { withSize, type GalleryCategory, type GalleryImage } from "@/data/gallery";
import type { Dictionary } from "@/lib/dictionaries";

type Filter = GalleryCategory | "all";

export default function Gallery({
  dict,
  images,
}: {
  dict: Dictionary;
  images: GalleryImage[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const filtered =
    filter === "all" ? images : images.filter((img) => img.category === filter);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: dict.gallery.categories.all },
    { key: "playground", label: dict.gallery.categories.playground },
    { key: "parties", label: dict.gallery.categories.parties },
    { key: "events", label: dict.gallery.categories.events },
  ];

  const openAt = (index: number) => setActiveIndex(index);
  const close = () => setActiveIndex(null);
  const showPrev = () =>
    setActiveIndex((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length));
  const showNext = () =>
    setActiveIndex((i) => (i === null ? null : (i + 1) % filtered.length));

  const active = activeIndex !== null ? filtered[activeIndex] : null;

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-2 text-sm font-extrabold transition-colors ${
              filter === f.key
                ? "bg-momo-orange text-momo-black"
                : "bg-momo-cream-dim text-momo-black/70 hover:bg-momo-green-700/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-momo-black/60">
          {dict.gallery.emptyState}
        </p>
      ) : (
        <div className="mt-10 columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
          {filtered.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => openAt(index)}
              className="group relative block w-full overflow-hidden rounded-2xl"
            >
              <Image
                src={withSize(img.url, 500, 500 + (index % 3) * 60)}
                alt={dict.gallery.categories[img.category]}
                width={500}
                height={500 + (index % 3) * 60}
                className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-momo-black/0 transition-colors group-hover:bg-momo-black/20" />
            </button>
          ))}
        </div>
      )}

      {active && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-momo-black/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={22} />
          </button>
          <button
            type="button"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              showPrev();
            }}
            className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"
          >
            <ChevronRight size={24} />
          </button>
          <div
            className="relative max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={withSize(active.url, 1200, 900)}
              alt={dict.gallery.categories[active.category]}
              width={1200}
              height={900}
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
